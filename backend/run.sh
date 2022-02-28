#!/bin/bash

###########
# This script is used for local development only.
# It will start a continuous build separately from bootRun.
# This enables live reload of the backend for development.
###########

# Start a continuous build process and send to background
gradle --no-daemon -t build -x test -x checkstyleMain -x checkstyleTest -x spotlessCheck -x bootBuildInfo &
# Wait for initial build to complete
sleep 15
# Start bootRun without build. It will live reload when the previous process rebuilds
gradle --no-daemon -x build -x test -x checkstyleMain -x checkstyleTest -x spotlessCheck bootRun