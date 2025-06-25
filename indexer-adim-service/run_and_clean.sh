#!/bin/bash

QUERY_ID=$1

# Run the script
python3 /app/index_creation.py "$QUERY_ID"

# Remove the cron job line that matches this script call
crontab -l | grep -v "run_and_clean.sh $QUERY_ID" | crontab -
