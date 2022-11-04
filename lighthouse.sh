#!/bin/bash

docker compose pull
docker-compose -f docker-compose.yml -f docker-compose.ci.yml build
docker-compose -f docker-compose.yml -f docker-compose.ci.yml up -d

echo "Waiting for backend to start at https://localhost.simplereport.gov/api/health"
http_response=0
polls=0
while [[ $http_response != "200" && $polls -lt 360 ]]; do
  ((polls++))
  sleep 1
  http_response=$(curl -skL -w "%{http_code}" "https://localhost.simplereport.gov/api/health")
done
if [[ $http_response -ne 200 ]]; then
  echo 'Backend never started. Exiting...'
  exit 1
fi
echo 'Backend started!'
echo

FACILITY_ID=$(docker exec db psql -qtA -v ON_ERROR_STOP=1 -p 5432 -U simple_report_migrations simple_report -c "select internal_id from simple_report.facility limit 1;")
echo "Our facility id is: $FACILITY_ID."

docker-compose -f docker-compose.yml -f docker-compose.ci.yml up
