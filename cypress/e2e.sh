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
   -a   Backend url path
   -p   Public url
   -f   frontend url path
   -o   Open Cypress for interactive testing
   -b   Set the browser to test against: https://docs.cypress.io/guides/guides/launching-browsers#Browsers
EOF
}

SPEC_PATH="cypress/e2e/**"
TEST_ENV="https://localhost.simplereport.gov"
CHECK_COMMIT="$(git rev-parse HEAD)"
BACKEND_URL_PATH="/api/actuator/health"
PUBLIC_URL="/app"
FRONTEND_URL_PATH="/health/commit"
RUN_OPEN=false
BROWSER="chrome"

while getopts "hs:r:c:a:p:f:o:b:" OPTION; do
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
  a)
    BACKEND_URL_PATH=$OPTARG
    ;;
  p)
    PUBLIC_URL=$OPTARG
    ;;
  f)
    FRONTEND_URL_PATH=$OPTARG
    ;;
  o)
    RUN_OPEN=$OPTARG
    ;;
  b)
    BROWSER=$OPTARG
    ;;
  ?)
    usage
    exit
    ;;
  esac
done

echo
[[ -n $SPEC_PATH ]] && echo "Running spec path--------$SPEC_PATH"
[[ -n $BROWSER ]] && echo "Browser selected---------$BROWSER"
[[ -n $CHECK_COMMIT ]] && echo "Current commit-----------$CHECK_COMMIT"
[[ -n $TEST_ENV ]] && echo "Testing against URL------$TEST_ENV"
[[ -n $BACKEND_URL_PATH ]] && echo "Backend health route-----$BACKEND_URL_PATH"
[[ -n $PUBLIC_URL ]] && echo "Public url---------------$PUBLIC_URL"
[[ -n $FRONTEND_URL_PATH ]] && echo "Frontent health route----$FRONTEND_URL_PATH"
[[ -n $RUN_OPEN ]] && echo "Run as interactive-------$RUN_OPEN"
echo 


http_response=0
polls=0
while [[ $http_response != *"UP"* && $polls -lt 72 ]]; do
  ((polls++))
  sleep 5
  echo "Waiting for backend to start at ${TEST_ENV}${BACKEND_URL_PATH}"
  http_response=$(curl -skL -w "%{http_code}" "${TEST_ENV}${BACKEND_URL_PATH}")
done
if [[ $http_response != *"UP"* ]]; then
  echo 'Backend never started. Exiting...'
  exit 1
fi
echo 'Backend started!'
echo

result=0
polls=0
while [[ $result -ne 1 && $polls -lt 48 ]]; do
  ((polls++))
  sleep 5
  echo "Waiting for frontend to start at ${TEST_ENV}${PUBLIC_URL}${FRONTEND_URL_PATH}"
  result=$(curl -skL "${TEST_ENV}${PUBLIC_URL}${FRONTEND_URL_PATH}" | grep -c '<title>SimpleReport</title>')
done
if [[ $result -ne 1 ]]; then
  echo 'Frontend never started. Exiting...'
  exit 1
fi
echo 'Frontend started!'
echo

echo 'App is online! Starting Cypress...'
echo

if [[ $RUN_OPEN = true ]]; then
  export CYPRESS_baseurl="$TEST_ENV$PUBLIC_URL"
  export CYPRESS_CHECK_COMMIT="$CHECK_COMMIT"
  export CYPRESS_CHECK_URL="$FRONTEND_URL_PATH"
  yarn run cypress open
else
  CYPRESS_CACHE_FOLDER=./tmp/Cypress DEBUG=cypress:* yarn run cypress run --browser "$BROWSER" --spec "$SPEC_PATH" --config-file cypress.config.js --config baseUrl="$TEST_ENV$PUBLIC_URL" --env CHECK_COMMIT="$CHECK_COMMIT",CHECK_URL="$FRONTEND_URL_PATH" --record --key "$CYPRESS_RECORD_KEY"
fi;
