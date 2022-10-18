#!/bin/bash

TEST_ENV="https://localhost.simplereport.gov"
BACKEND_URL_PATH="/api/health"
PUBLIC_URL="/app"
FRONTEND_URL_PATH="/health/commit"

docker compose pull
docker-compose -f docker-compose.yml -f docker-compose.ci.yml up

echo "Waiting for backend to start at ${TEST_ENV}${BACKEND_URL_PATH}"
http_response=0
polls=0
while [[ $http_response != "200" && $polls -lt 360 ]]; do
  echo "checking backend health"
  ((polls++))
  sleep 1
  http_response=$(curl -skL -w "%{http_code}" "${TEST_ENV}${BACKEND_URL_PATH}")
done
if [[ $http_response -ne 200 ]]; then
  echo 'Backend never started. Exiting...'
  exit 1
fi
echo 'Backend started!'
echo

echo "Waiting for frontend to start at ${TEST_ENV}${PUBLIC_URL}${FRONTEND_URL_PATH}"
result=0
polls=0
while [[ $result -ne 1 && $polls -lt 240 ]]; do
  echo "checking frontend health"
  ((polls++))
  sleep 1
  result=$(curl -skL "${TEST_ENV}${PUBLIC_URL}${FRONTEND_URL_PATH}" | grep -c '<title>SimpleReport</title>')
done
if [[ $result -ne 1 ]]; then
  echo 'Frontend never started. Exiting...'
  exit 1
fi
echo 'Frontend started!'
echo

echo

# start server command
echo 'applesaredelicious'

echo 'App is online!'
echo

#echo 'Installing chromium and lighthouse...'
#apt-get install chromium
#npm install -g lighthouse
#echo
#
#echo 'Starting lighthouse...'
#echo
#mkdir lighthouse -p
#lighthouse https://localhost.simplereport.gov --output json --output-path lighthouse/output.json --chrome-flags="--headless"