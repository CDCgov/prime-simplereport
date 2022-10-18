#!/bin/bash

docker compose pull
docker-compose -f docker-compose.yml -f docker-compose.ci.yml up