#!/bin/bash

###########
# This script is used for local development only.
# It will spin up a create-react-app dev server and
# a Spring Boot "bootRun" task, output server logs, and clean
# up the processes when exited.
###########

GREEN='\033[0;32m'
PURPLE='\033[0;35m'

function prepend() { 
    NC='\033[0m' # No Color
    while read line; do 
        echo -e "${2}${1}:${NC} ${line}" 
    done
}

# This function kills the server processes when the script is interrupted
# Takes the PID of the frontend server as an argument
cleanup() {
    echo
    echo "Script stopped, performing cleanup..."
    kill $1 # kill frontend server
    cd ${BACKEND_DIR}
    ./gradlew --stop
    ./gradlew clean

    rm -rf ${BACKEND_DIR}/.gradle/daemon # Daemons _cannot_ survive script shutdown
    echo "Cleanup complete!"
}

# Get environment variables
set -o allexport
source .env

# Get dir paths
ROOT_DIR=$(pwd)
FRONTEND_DIR=${ROOT_DIR}/frontend
BACKEND_DIR=${ROOT_DIR}/backend

# Start frontend server
cd ${FRONTEND_DIR}
echo "Starting frontend server..."
BROWSER=none yarn start | prepend "frontend" $GREEN &
NPM_PID=$!
echo "frontend server PID: ${NPM_PID}"
trap "cleanup ${NPM_PID}" EXIT

# Build backend
cd ${BACKEND_DIR}
# Start a continuous build process and send to background
./gradlew --no-daemon -t build -x test -x checkstyleMain -x checkstyleTest -x spotlessCheck -x bootBuildInfo | prepend "backend" $PURPLE &
# Wait for initial build to complete
sleep 15
# Start bootRun without build. It will live reload when the previous process rebuilds
./gradlew --no-daemon -x build -x test -x checkstyleMain -x checkstyleTest -x spotlessCheck bootRun --args='--spring.profiles.active=local' | prepend "backend" $PURPLE
