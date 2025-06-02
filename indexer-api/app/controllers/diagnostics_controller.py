from typing import Any, Dict, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.tc_query import TCQuery
from app.models.query_log import QueryLog
from sqlglot import parse_one, exp
from sqlglot.expressions import Expression
from app.schemas.diagnostics import TCQueryResponse, TCQueriesResponse

# Utility functions to find time-consuming queries

def normalize(value: float, min_value: float, max_value: float) -> float:
    """Normalize a value to a range of 0 to 1."""
    if min_value == max_value:
        return 0.0
    return (value - min_value) / (max_value - min_value)

def find_time_consuming_queries(data: List[Dict]) -> List[Dict]:
    """
    Find time-consuming queries from the provided data.
    This function normalizes the scores of the queries based on their metrics got from the database.
    It returns a list of dictionaries containing the query information and its normalized score.
    """
    # Extracting the relevant metrics from the data
    metrics  = {
        "total_exec_time": [d['total_exec_time'] for d in data],
        "mean_exec_time": [d['mean_exec_time'] for d in data],
        "calls": [d['calls'] for d in data],
        "shared_blks_read": [d['shared_blks_read'] for d in data],
        "temp_blks_written": [d['temp_blks_written'] for d in data],
    }

    min_max_values = {key: (min(values), max(values)) for key, values in metrics.items()}

    # Normalizing the scores for each metric
    for d in data:
        normalized_total_exec_time = normalize(d['total_exec_time'], *min_max_values['total_exec_time'])
        normalized_mean_exec_time = normalize(d['mean_exec_time'], *min_max_values['mean_exec_time'])
        normalized_calls = normalize(d['calls'], *min_max_values['calls'])
        normalized_shared_blks_read = normalize(d['shared_blks_read'], *min_max_values['shared_blks_read'])
        normalized_temp_blks_written = normalize(d['temp_blks_written'], *min_max_values['temp_blks_written'])

        # Calculate the final score based on the normalized values
        d['score'] = (
            0.3 * normalized_total_exec_time +
            0.25 * normalized_mean_exec_time +
            0.15 * normalized_calls +
            0.15 * normalized_shared_blks_read +
            0.15 * normalized_temp_blks_written
        )
    
    # Sort the data based on the score in descending order
    data.sort(key=lambda x: x['score'], reverse=True)
    # Return only the TC queries whose score is greater than 0.5
    data = [d for d in data if d['score'] > 0.0] # Change this as needed
    return data

# Utility functions to find the best database indexes for time consuming queries

def ensure_table(table_name: str, table_info: Dict[str, Dict[str, Any]]) -> None:
    """
    Helper to ensure table entry exists in the table_info dictionary.
    If the table does not exist, it creates a new entry with initialized values.
    """
    if table_name not in table_info:
        table_info[table_name] = {
            'where_cols': set(),
            'order_exprs': [],
            'group_exprs': [],
            'where_all_eq': True
        }

def get_alias_mapping(query: Expression) -> Dict[str, str]:
    """
    Helper to extract alias mapping from the query.
    This function parses the query and returns a dictionary mapping aliases to their corresponding table names.
    """
    alias_map = {}
    from_clause = query.args.get("from")
    if not from_clause:
        return alias_map
    for table in from_clause.find_all(exp.Table):
        table_name = table.name
        alias = None
        alias_expr = table.args.get("alias")
        if alias_expr:
            alias = alias_expr.name
        else:
            alias = table_name
        alias_map[alias] = table_name
    return alias_map

def resolve_column(col_expr: Expression, alias_map: Dict[str, str]) -> Tuple[str, str]:
    """
    Helper to resolve the column expression to its corresponding table and column names.
    This function takes a column expression and an alias mapping, and returns the table name and column name.
    """
    table = col_expr.args.get("table")
    column = col_expr.name
    if table:
        table = table.name
        actual_table_name = alias_map.get(table, table)
    else:
        if len(alias_map) == 1:
            actual_table_name = next(iter(alias_map.values()))
        else:
            actual_table_name = None
    return actual_table_name, column

def process_where_conditions(query: Expression, table_info: Dict[str, Dict[str, Any]], alias_map: Dict[str, str]) -> None:
    """
    Helper to process WHERE conditions in the query.
    This function extracts the WHERE conditions from the query and updates the table_info dictionary with the relevant information.
    """
    where_clause = query.args.get("where")
    if not where_clause:
        return
    
    # Find all comparison expressions in the WHERE clause
    for operation in (exp.EQ, exp.In, exp.GT, exp.GTE, exp.LT, exp.LTE, exp.NEQ):
        for comparison in where_clause.find_all(operation):
            left = comparison.args.get("this")
            right = comparison.args.get("expression") or comparison.args.get("value") or comparison.args.get("expressions")

            # Handle only if one side is a column and the other side is a literal or column
            if isinstance(left, exp.Column):
                table, column = resolve_column(left, alias_map)
                if table:
                    ensure_table(table, table_info)
                    # If this operator is not equality or IN, mark non-equality
                    if not isinstance(comparison, (exp.EQ, exp.In)):
                        table_info[table]['where_all_eq'] = False
                    table_info[table]['where_cols'].add(column)
            elif isinstance(right, exp.Column):
                table, column = resolve_column(right, alias_map)
                if table:
                    ensure_table(table, table_info)
                    # If this operator is not equality or IN, mark non-equality
                    if not isinstance(comparison, (exp.EQ, exp.In)):
                        table_info[table]['where_all_eq'] = False
                    table_info[table]['where_cols'].add(column)

def process_order_by(query: Expression, table_info: Dict[str, Dict[str, Any]], alias_map: Dict[str, str]) -> None:
    """
    Helper to process ORDER BY clause in the query.
    This function extracts the ORDER BY expressions from the query and updates the table_info dictionary with the relevant information.
    """
    order_by = query.args.get("order")
    if not order_by:
        return
    for order_expr in order_by.args.get("expressions", []):
        # If wrapped (exp.Ordered), extract the inner expression and direction
        desc = False
        expr = order_expr
        if isinstance(order_expr, exp.Ordered):
            expr = order_expr.this
            desc = order_expr.args.get("desc", False)
        
        # Find any columns used in this expression to determine the table
        columns = list(expr.find_all(exp.Column))
        if columns:
            # Assuming all columns in the ORDER BY clause are from the same table
            first_table = None
            for column in columns:
                table, _ = resolve_column(column, alias_map)
                if table:
                    first_table = table if not first_table else first_table
            
            if first_table: 
                ensure_table(first_table, table_info)
                # Add the expression to the order_exprs with DESC. Scale for ASC in future
                expr_sql = str(expr)
                if desc:
                    expr_sql += " DESC"
                table_info[first_table]['order_exprs'].append(expr_sql)

def process_group_by(query: Expression, table_info: Dict[str, Dict[str, Any]], alias_map: Dict[str, str]) -> None:
    """
    Helper to process GROUP BY clause in the query.
    This function extracts the GROUP BY expressions from the query and updates the table_info dictionary with the relevant information.
    """
    group_by = query.args.get("group")
    if not group_by:
        return
    for group_expr in group_by.args.get("expressions", []):
        cols = list(group_expr.find_all(exp.Column))
        if cols:
            first_tbl = None
            for col in cols:
                tbl, _ = resolve_column(col, alias_map)
                if tbl:
                    first_tbl = tbl if not first_tbl else first_tbl
            if first_tbl:
                ensure_table(first_tbl, table_info)
                expr_sql = str(group_expr)
                table_info[first_tbl]['group_exprs'].append(expr_sql)

def exists_index(key_str: str, existing_defs: List[str]) -> bool:
    """
    Helper to check if an index already exists in the existing_defs list.
    This function takes a key string and a list of existing index definitions, and returns True if the index exists, False otherwise.
    """
    return any(key_str in index for index in existing_defs)

def case_1_single_where_column(where_cols: List[str], order_exprs: List[str], group_exprs: List[str], table_name: str, create_stmts: List[str], method: str, existing_defs: List[Tuple[str, ...]]) -> None:
    """
    Case 1: Single WHERE column with ORDER BY and GROUP BY expressions.
    This function generates the CREATE INDEX statement for this case and appends it to the create_stmts list.
    """
    if len(where_cols) == 1 and not order_exprs and not group_exprs:
        col = where_cols[0]
        key = f"({col})"
        if not exists_index(key, existing_defs):
            idx_name = f"idx_{table_name}_{col}_{method}"
            stmt = f"CREATE INDEX {idx_name} ON {table_name} USING {method} ({col});"
            create_stmts.append(stmt)       

def case_2_where_columns_with_order_by(where_cols: List[str], order_exprs: List[str], group_exprs: List[str], table_name: str, create_stmts: List[str], existing_defs: List[Tuple[str, ...]]) -> None:
    if len(where_cols) >= 1 and (order_exprs or group_exprs):
        # For each WHERE column, combine with each ORDER/GROUP expression
        for col in where_cols:
            for expr in order_exprs + group_exprs:
                # Form index key (col, expression)
                key_str = f"({col}, {expr})"
                # Check existence: look for both parts in an existing index
                if not exists_index(key_str, existing_defs):
                    # Choose method: if any expr or order, we should use btree (for sorting)
                    idx_type = "btree"
                    # Generate a name: use col and an identifier for expr
                    expr_label = "expr"
                    # Make a short label from expr to avoid overly long names
                    if expr.lower().startswith("case"):
                        expr_label = "case"
                    elif " " not in expr and expr.isidentifier():
                        expr_label = expr
                    idx_name = f"idx_{table_name}_{col}_{expr_label}_{idx_type}"
                    stmt = f"CREATE INDEX {idx_name} ON {table_name} USING {idx_type} ({col}, {expr});"
                    create_stmts.append(stmt)
                
def case_3_where_columns_composite_index(where_cols: List[str], order_exprs: List[str], group_exprs: List[str], table_name: str, create_stmts: List[str], method: str, existing_defs) -> None:
    """
    Case 3: Case 3: Multiple WHERE columns (no explicit ORDER) -> composite index on all (covered by multi-column rule)
    This function generates the CREATE INDEX statement for this case and appends it to the create_stmts list.
    """
    if len(where_cols) > 1 and not (order_exprs or group_exprs):
        # Create a multi-column index on all where_cols
        cols_joined = ", ".join(where_cols)
        key_str = f"({cols_joined})"
        if not exists_index(key_str, existing_defs):
            idx_name = f"idx_{table_name}_{'_'.join(where_cols)}_{method}"
            stmt = f"CREATE INDEX {idx_name} ON {table_name} USING {method} ({cols_joined});"
            create_stmts.append(stmt)

def case_4_pure_order_group_by(where_cols: List[str], order_exprs: List[str], group_exprs: List[str], table_name: str, create_stmts: List[str], existing_defs: List[Tuple[str, ...]]) -> None:
    if not where_cols and (order_exprs or group_exprs):
        for expr in order_exprs + group_exprs:
            key_str = f"({expr})"
            if not exists_index(key_str, existing_defs):
                idx_type = "btree"
                # Name expressions with a generic marker
                expr_label = expr.strip().split()[0]  # e.g. first word of CASE or function
                idx_name = f"idx_{table_name}_expr_{expr_label}_{idx_type}"
                stmt = f"CREATE INDEX {idx_name} ON {table_name} USING {idx_type} ({expr});"
                create_stmts.append(stmt)

def find_best_indexes(query: str, db: Session) -> List[str]:
    """
    Find the best indexes for the given query based on the table information.
    This function takes a SQL query string and a database session,
    and returns a list of CREATE INDEX statements for the best indexes.
    """
    # Parse the SQL query
    try:
        parsed_query = parse_one(query, read="postgres")
    except Exception as e:
        raise ValueError(f"Failed to parse SQL query: {e}")
    
    # Initialize table information dictionary
    table_info = {}
    
    # Extract alias mapping
    for query in parsed_query.find_all(exp.Select):
        alias_map = get_alias_mapping(query)
        # Process WHERE conditions
        process_where_conditions(query, table_info, alias_map)
        # Process ORDER BY clause
        process_order_by(query, table_info, alias_map)
        # Process GROUP BY clause
        process_group_by(query, table_info, alias_map)
    
    create_stmts = []

    for table_name, info in table_info.items():
        where_cols = list(info['where_cols'])
        order_exprs = info['order_exprs']
        group_exprs = info['group_exprs']
        where_all_eq = info['where_all_eq']

        # Get existing index definitions from the database
        existing_defs = db.execute(text(f"SELECT indexdef FROM pg_indexes WHERE tablename = '{table_name}';")).fetchall()
        existing_defs = [tuple(row) for row in existing_defs]

        # Determine the method to use for the index
        method = "hash" if where_all_eq and not order_exprs and not group_exprs else "btree"

        # Case 1: Single WHERE column with ORDER BY and GROUP BY expressions
        case_1_single_where_column(where_cols, order_exprs, group_exprs, table_name, create_stmts, method, existing_defs)
        
        # Case 2: WHERE columns with ORDER BY and GROUP BY expressions
        case_2_where_columns_with_order_by(where_cols, order_exprs, group_exprs, table_name, create_stmts, existing_defs)
        
        # Case 3: Multiple WHERE columns (no explicit ORDER) -> composite index on all
        case_3_where_columns_composite_index(where_cols, order_exprs, group_exprs, table_name, create_stmts, method, existing_defs)
        
        # Case 4: Pure ORDER or GROUP BY expressions
        case_4_pure_order_group_by(where_cols, order_exprs, group_exprs, table_name, create_stmts, existing_defs)

    # Return the list of CREATE INDEX statements
    return create_stmts

# Entry point function to run diagnostics
def run_diagnostics(db_org: Session, db_b_plus: Session) -> List[TCQueriesResponse]:
    """
    Analyze time-consuming queries and return a list of TCQuery objects.
    This function retrieves the time-consuming queries from the database,
    normalizes their scores, and returns them as a list of TCQuery objects alongside other information inside TCQuery.
    In addition, it also finds the best database indexes for the time-consuming queries and include them in the same response.
    """
    # Execute the raw SQL and get the result object
    result = db_org.execute(text(
        "SELECT query, total_exec_time, mean_exec_time, calls, shared_blks_read, temp_blks_written "
        "FROM pg_stat_statements "
        "WHERE calls > 0 AND query ILIKE '%where%' AND NOT (query ILIKE ANY (ARRAY['%pg_stat_statements%', 'show %', 'select current_schema%', 'select pg_catalog.version%', 'rollback', 'begin', 'select n.nspname%', 'select t.oid%', 'select column_name%', '%pg_catalog%', '%indexdef%' ]));"
    ))

    # Fetch rows from the result
    rows = result.fetchall()

    # Get column names
    columns = result.keys()
    # Convert rows to a list of dictionaries
    data = [dict(zip(columns, row)) for row in rows]

    if data:
    
        time_consuming_queries = find_time_consuming_queries(data)

        # Iterate over the time-consuming queries to find the best indexes
        for query_data in time_consuming_queries:
            query = query_data['query']
            # Find the best indexes for the current query
            create_stmts = find_best_indexes(query, db_org)
            # Add the create statements to the query data
            query_data['indexes'] = create_stmts

        # Save the time-consuming queries to the database if the query is not already in the tc_query table
        try:
            for query_data in time_consuming_queries:
                # Check if the query already exists in the tc_query table
                existing_query = db_b_plus.query(TCQuery).filter(TCQuery.query == query_data['query']).first()
                if not existing_query:
                    # Create a new TCQuery object
                    new_query = TCQuery(
                        query=query_data['query'],
                        total_exec_time=query_data['total_exec_time'],
                        mean_exec_time=query_data['mean_exec_time'],
                        calls=query_data['calls'],
                        shared_blks_read=query_data['shared_blks_read'],
                        temp_blks_written=query_data['temp_blks_written'],
                        score=query_data['score'],
                        indexes=query_data['indexes']
                    )
                    # Add the new query to the session
                    db_b_plus.add(new_query)
                    db_b_plus.flush()
                else:
                    # If the query already exists, update its attributes
                    existing_query.total_exec_time = query_data['total_exec_time']
                    existing_query.mean_exec_time = query_data['mean_exec_time']
                    existing_query.calls = query_data['calls']
                    existing_query.shared_blks_read = query_data['shared_blks_read']
                    existing_query.temp_blks_written = query_data['temp_blks_written']
                    existing_query.score = query_data['score']
                    existing_query.indexes = query_data['indexes']

                    db_b_plus.flush()
            # Commit the session to save the changes
            db_b_plus.commit()
        except Exception as e:
            # Rollback the session in case of an error
            db_b_plus.rollback()
            raise Exception(f"Error saving time-consuming queries to the database: {e}")
    
    # Fetch all TCQuery objects from the database
    queries = db_b_plus.query(TCQuery).all()
    if queries:
        # Convert the list of TCQuery objects to a list of TCQueryResponse objects
        tc_query_responses = [TCQueryResponse.model_validate(query) for query in queries]
        return TCQueriesResponse(queries=tc_query_responses)
    
    return []




    


    



    