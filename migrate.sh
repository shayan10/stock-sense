#!/bin/bash

# Load environment variables from .env file
set -a
source .env
set +a
echo $POSTGRES_DB

# Run the migration
DATABASE_URL=postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB ts-node node_modules/.bin/node-pg-migrate up -c tsconfig.json
