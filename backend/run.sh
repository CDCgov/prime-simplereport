#!/bin/bash

###########
# This script is used for local development only.
# It will start a continuous build separately from bootRun.
# This enables live reload of the backend for development.
###########

# Start a continuous build process and send to background
echo "Starting continuous build..."
gradle --no-daemon -t build -x test -x checkstyleMain -x checkstyleTest -x spotlessCheck -x bootBuildInfo & sleep 15
echo "Continuous build started."
# Start bootRun without build. It will live reload when the previous process rebuilds
echo "Starting bootRun..."
gradle --no-daemon -x build -x test -x checkstyleMain -x checkstyleTest -x spotlessCheck bootRun
