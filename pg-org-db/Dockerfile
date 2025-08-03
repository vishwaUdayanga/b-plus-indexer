FROM postgres:16

COPY ./init-scripts/pg-org-init.sql /docker-entrypoint-initdb.d/init.sql

# Configure PostgreSQL logging behavior
CMD ["postgres", "-c", "shared_preload_libraries=pg_stat_statements", "-c", "pg_stat_statements.save=on", "-c", "logging_collector=on", "-c", "log_directory=/var/log/postgresql","-c", "log_filename=postgresql-%Y-%m-%d_%H%M%S.log", "-c", "log_statement=all", "-c", "log_destination=stderr"]