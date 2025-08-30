#!/bin/bash

# Setup the time zone
export TZ=Asia/Colombo
ln -snf /usr/share/zoneinfo/$TZ /etc/localtime
echo $TZ > /etc/timezone


# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Export all env vars
printenv | grep -v "no_proxy" >> /etc/environment 

touch /var/log/execute_queries.log
chmod 666 /var/log/execute_queries.log

# Create cron job file with 4 different queries
cat <<EOL > /etc/cron.d/execute_queries
# Run first query 
30 16 * * 5 root /usr/local/bin/python3 /app/execute_query.py "SELECT * FROM operation_bulletin WHERE deleted_by = '';" >> /var/log/execute_queries.log 2>&1

# Run second query 
0 8 * * 1 root /usr/local/bin/python3 /app/execute_query.py "SELECT * FROM operation_bulletin WHERE item_code = 'ITEM-102';" >> /var/log/execute_queries.log 2>&1

# Run third query 
0 8 * * 3 root /usr/local/bin/python3 /app/execute_query.py "SELECT CASE WHEN edited_time IS NULL OR edited_time < created_time THEN created_time ELSE edited_time END FROM sheet_inventory WHERE created_by = 'user_4' ORDER BY (CASE WHEN edited_time IS NULL OR edited_time < created_time THEN created_time ELSE edited_time END) DESC LIMIT 1;" >> /var/log/execute_queries.log 2>&1

# Run fourth query 
0 8 * * 4 root /usr/local/bin/python3 /app/execute_query.py "SELECT s.id, s.operation_code, od.operation_description AS operation_description, s.running_smv, s.running_video, (SELECT image FROM operation_images WHERE operation_index_no = s.id AND image_number = 0 LIMIT 1) AS image0, (SELECT image FROM operation_images WHERE operation_index_no = s.id AND image_number = 1 LIMIT 1) AS image1 FROM smvdatabase s JOIN operation_description od ON s.operation_description = od.id WHERE s.operation_code = 'OP-1' ORDER BY s.id;" >> /var/log/execute_queries.log 2>&1
EOL

# Set correct permissions
chmod 0644 /etc/cron.d/execute_queries

# Start cron in foreground
cron -f
