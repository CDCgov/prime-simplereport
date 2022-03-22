#!/bin/bash

java -jar ./wiremock-jre8-standalone-2.29.1.jar --local-response-templating --port 8088 --root-dir ./cypress/stubs/$1