#!/bin/bash

TEST_ENV="https://localhost.simplereport.gov"
BACKEND_URL_PATH="/api/health"
PUBLIC_URL="/app"
FRONTEND_URL_PATH="/health/commit"

echo "Waiting for backend to start at ${TEST_ENV}${BACKEND_URL_PATH}"
http_response=0
polls=0
while [[ $http_response != "200" && $polls -lt 360 ]]; do
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

echo 'App is online! Starting Lighthouse...'
echo

echo 'Installing mkcert...'
sudo apt install libnss3-tools
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
brew install mkcert
mkcert -install

npm install -g @lhci/cli@0.9.x && lhci autorun