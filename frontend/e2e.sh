#!/bin/bash

usage() {
  cat <<EOF
usage: $0 options

This script runs the cypress e2e tests.

OPTIONS:
   -h   Display usage help
   -s   Relative path to the spec that you desire to run
   -r   Environment to run against
   -c   Deployed commit hash
   -b   Backend url path
   -f   frontend url path
EOF
}

SPEC_PATH="cypress/**"
TEST_ENV="http://localhost.simplereport.gov"
if [ -d ../.git ]; then
  CHECK_COMMIT="$(git rev-parse HEAD)"
fi
BACKEND_URL_PATH="/api/health"
FRONTEND_URL_PATH="/health/commit"

while getopts "hs:r:c:b:f:" OPTION; do
  case $OPTION in
  h)
    usage
    exit 1
    ;;
  s)
    SPEC_PATH=$OPTARG
    ;;
  r)
    TEST_ENV=$OPTARG
    ;;
  c)
    CHECK_COMMIT=$OPTARG
    ;;
  b)
    BACKEND_URL_PATH=$OPTARG
    ;;
  f)
    FRONTEND_URL_PATH=$OPTARG
    ;;
  ?)
    usage
    exit
    ;;
  esac
done

echo
[[ -n $SPEC_PATH ]] && echo "Running spec path--------$SPEC_PATH" || echo "Running all specs!"
[[ -n $TEST_ENV ]] && echo "Testing against URL------$TEST_ENV"
[[ -n $CHECK_COMMIT ]] && echo "Current commit-----------$CHECK_COMMIT"
[[ -n $BACKEND_URL_PATH ]] && echo "Backend health route-----$BACKEND_URL_PATH"
[[ -n $FRONTEND_URL_PATH ]] && echo "Frontent health route----$FRONTEND_URL_PATH"
echo 

echo "Starting Wiremock for app bootup..."
./cypress/support/wiremock/download-wiremock.sh >/dev/null 2>&1
./cypress/support/wiremock/start-wiremock.sh orgSignUp >/dev/null 2>&1 &
echo "Wiremock started!"
echo

echo "Waiting for backend to start..."
http_response=0
polls=0
while [[ $http_response != "200" && $polls -lt 240 ]]; do
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

echo 'Waiting for frontend to start...'
result=0
polls=0
while [[ $result -ne 1 && $polls -lt 240 ]]; do
  ((polls++))
  sleep 1
  result=$(curl -skL "${TEST_ENV}${FRONTEND_URL_PATH}" | grep -c '<title>SimpleReport</title>')
done
if [[ $result = 0 ]]; then
  echo 'Frontend never started. Exiting...'
  exit 1
fi
echo 'Frontend started!'
echo

echo 'App is online! Starting Cypress...'
echo

yarn run cypress run --browser firefox --spec "$SPEC_PATH" --env CYPRESS_baseurl="$TEST_ENV",CHECK_COMMIT="$CHECK_COMMIT",CHECK_URL="$FRONTEND_URL_PATH"
