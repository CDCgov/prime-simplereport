#!/bin/bash

###########
# This script is used for local development only.
# It will ensure certs are generated using mkcert and
# the certs have the correct names for the nginx container.
# It will also install node_modules so they are present to be
# mounted into the frontend container.
###########

# This function shuts down docker compose on CTRL+C
cleanup() {
    echo
    echo "App stopped, shutting down containers..."
    docker compose -f docker-compose.yml $fileFlag exec backend gradle clean --stop
    docker compose -f docker-compose.yml $fileFlag down
    echo "Thanks for using Simple Report!"
    exit
}

if ! [ -x "$(command -v mkcert)" ]; then
  echo 'Error: mkcert is not installed. Please check the README for installation instructions.' >&2
  exit 1
fi

echo "Checking for certs..."

mkdir -p certs

if [ -n "$(ls -A certs 2>/dev/null)" ]; then
  echo "Certs found! Skipping generation."
else
  echo "Certs missing, generating..."
  mkcert -install
  cd certs
  mkcert localhost.simplereport.gov
  mv localhost.simplereport.gov.pem localhost.simplereport.gov.crt
  mv localhost.simplereport.gov-key.pem localhost.simplereport.gov.key
  cd ..
  echo "🎉 Certs generated!"
fi

echo "Starting Docker Compose..."

while getopts ":l" opt;
do
  case $opt in
    l)
      echo "Composing with Locust!"
      fileFlag="-f docker-compose.locust.yml"
      ;;
    \?)
      echo "Invalid start option: -$OPTARG"
      ;;
  esac  
done

docker compose -f docker-compose.yml $fileFlag pull
docker compose -f docker-compose.yml $fileFlag up -d
docker compose -f docker-compose.yml $fileFlag logs -f

trap "cleanup" EXIT