#!/usr/bin/env bash

docker-compose -f test.yml up -d
export NODE_ENV=test
export REDIS_HOST=localhost

npm run migrate:up
npx jest
