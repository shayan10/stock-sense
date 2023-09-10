#!/bin/sh

if [ "$NODE_ENV" = "test" ]; then
  export DATABASE_URL=/app/db.sqlite
else
  export DATABASE_URL=postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST/$POSTGRES_DB
fi

# Run migrations
npm run migrate:up

# Generate types
npm run generate:types

# Start the application
if [ "$NODE_ENV" = "development" ]; then
  npm run dev
else
  npm start
fi
