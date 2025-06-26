FROM python:3.10

# Set up work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Give execution permission to entrypoint
RUN chmod +x /app/entrypoint.sh

# Give execution permission to run_and_clean.sh
RUN chmod +x /app/run_and_clean.sh

# Install cron
RUN apt-get update && apt-get install -y cron

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
