#!/bin/bash

# Start the postgres service in detached mode
docker-compose up -d postgres

# Run npm script in the containerized app
docker-compose run --rm ts-node-docker npm run $@
