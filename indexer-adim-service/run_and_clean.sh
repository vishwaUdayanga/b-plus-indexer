#!/bin/bash

QUERY_ID=$1

# Run the index creation script
/usr/local/bin/python3 /app/index_creation.py "$QUERY_ID"

# Safely remove this cron job from /etc/cron.d/adim_dynamic_jobs
sed -i "/run_and_clean.sh $QUERY_ID/d" /etc/cron.d/adim_dynamic_jobs