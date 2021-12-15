#!/bin/bash
echo "Starting Wiremock for app bootup..."
./cypress/support/wiremock/download-wiremock.sh > /dev/null 2>&1
./cypress/support/wiremock/start-wiremock.sh orgSignUp > /dev/null 2>&1 &

echo "Waiting for app bootup..."
sleep 30

echo 'Waiting for backend to start...'
http_response=$(curl -skL -w "%{http_code}" http://localhost.simplereport.gov/api/health)

polls=0
while [[ $http_response != "200" && $polls -lt 180 ]]; do
  ((polls++))
  sleep 1
  http_response=$(curl -skL -w "%{http_code}" http://localhost.simplereport.gov/api/health)
done
echo

if [[ $result -ne 0 ]]; then
  echo 'Backend never started. Exiting...'
  exit 1
fi

echo 'Backend started!'
echo 'Waiting for frontend to start...'
result=$(curl -skL http://localhost.simplereport.gov/health/ping | grep -c '<title>SimpleReport</title>')

polls=0
while [[ $result -ne 1 && $polls -lt 180 ]]; do
  ((polls++))
  sleep 1
  result=$(curl -skL http://localhost.simplereport.gov/health/ping | grep -c '<title>SimpleReport</title>')
done
echo

if [[ $result -ne 1 ]]; then
  echo 'Frontend never started. Exiting...'
  exit 1
fi

echo 'Frontend started!'

echo 'App is online! Starting Cypress...'

yarn run cypress run --browser firefox