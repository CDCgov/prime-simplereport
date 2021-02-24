#!/bin/bash

trap trapint 2
function trapint {
    exit 0
}

echo 'Waiting for backend to boot...'
curl -k http://localhost:8080/health > /dev/null 2>&1
result=$?

polls=0
while [[ $result -ne 0 && $polls -lt 120 ]]; do
  ((polls++))
  echo 'Waiting...'
  sleep 5
  curl -k http://localhost:8080/health > /dev/null 2>&1
  result=$?
done

if [[ $result -ne 0 ]]; then
  echo 'Backend never started. Exiting...'
  exit 1
fi

echo 'Waiting for frontend to boot...'
curl -k http://localhost:3000 > /dev/null 2>&1
result=$?

polls=0
while [[ $result -ne 0 && $polls -lt 120 ]]; do
  ((polls++))
  echo 'Waiting...'
  sleep 5
  curl -k http://localhost:3000 > /dev/null 2>&1
  result=$?
done

if [[ $result -ne 0 ]]; then
  echo 'Frontend never started. Exiting...'
  exit 1
fi

echo 'App is online! Waiting for Selenium...'
curl localhost:4444 > /dev/null 2>&1
result=$?

polls=0
while [[ $result -ne 0 && $polls -lt 120 ]]; do
  ((polls++))
  echo 'Waiting...'
  sleep 2
  curl localhost:4444 > /dev/null 2>&1
  result=$?
done

if [[ $result -ne 0 ]]; then
  echo 'Selenium never started. Exiting...'
  exit 1
fi

echo 'Selenium is online! Waiting for nodes to register...'
echo 'Waiting...'
sleep 2
curl localhost:5555 > /dev/null 2>&1
result=$?

polls=0
while [[ $result -ne 0 && $polls -lt 120 ]]; do
  ((polls++))
  echo 'Waiting...'
  sleep 2
  curl localhost:5555 > /dev/null 2>&1
  result=$?
done

if [[ $result -ne 0 ]]; then
  echo 'Nodes never started. Exiting...'
  exit 1
fi

echo 'Browser nodes online! Starting Nightwatch...'

npx nightwatch -e selenium.firefox "$@"
