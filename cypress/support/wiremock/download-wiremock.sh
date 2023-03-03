#!/bin/bash

if [[ ! -f "wiremock-jre8-standalone-2.34.0.jar" ]]; then
  curl -s -O https://repo1.maven.org/maven2/com/github/tomakehurst/wiremock-jre8-standalone/2.34.0/wiremock-jre8-standalone-2.34.0.jar
fi