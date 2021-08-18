#!/bin/bash
printf 'Starting nginx docker container'
docker build -t nginx -f ./e2e/utils/nginx/Dockerfile.nginx . && docker run -d -p 80:80 nginx:latest

printf 'Waiting for backend to start...'
curl -k http://localhost:8080/health > /dev/null 2>&1
result=$?

polls=0
while [[ $result -ne 0 && $polls -lt 180 ]]; do
  ((polls++))
  printf .
  sleep 1
  curl -k http://localhost:8080/health > /dev/null 2>&1
  result=$?
done
echo

if [[ $result -ne 0 ]]; then
  echo 'Backend never started. Exiting...'
  exit 1
fi

printf 'Waiting for frontend to start...'
curl -k http://localhost:3000 > /dev/null 2>&1
result=$?

polls=0
while [[ $result -ne 0 && $polls -lt 180 ]]; do
  ((polls++))
  printf .
  sleep 1
  curl -k http://localhost:3000 > /dev/null 2>&1
  result=$?
done
echo

if [[ $result -ne 0 ]]; then
  echo 'Frontend never started. Exiting...'
  exit 1
fi

echo 'App is online! Starting Nightwatch...'

npx nightwatch -e "$@"