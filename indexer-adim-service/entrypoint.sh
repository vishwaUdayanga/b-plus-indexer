#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

touch /var/log/regular_script.log
chmod 666 /var/log/regular_script.log

# Create cron job file (DO NOT call crontab on it)
echo "20 2 * * * root python3 /app/regular_script.py >> /var/log/regular_script.log 2>&1" > /etc/cron.d/regular_script_job
chmod 0644 /etc/cron.d/regular_script_job

# Start cron in foreground
cron -f
