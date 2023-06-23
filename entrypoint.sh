#!/bin/bash

# Load environment variables from .env file
set -a
source .env
set +a

# Create the DATABASE_URL variable
export DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"

# Execute the command
exec "$@"

