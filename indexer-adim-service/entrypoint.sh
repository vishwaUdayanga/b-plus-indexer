#!/bin/bash

# Setup the time zone
export TZ=Asia/Colombo
ln -snf /usr/share/zoneinfo/$TZ /etc/localtime
echo $TZ > /etc/timezone


# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

touch /var/log/regular_script.log
chmod 666 /var/log/regular_script.log

# Create cron job file 
echo "40 13 * * * root /usr/local/bin/python3 /app/regular_script.py >> /var/log/regular_script.log 2>&1" > /etc/cron.d/regular_script_job
chmod 0644 /etc/cron.d/regular_script_job

# Start cron in foreground
cron -f
