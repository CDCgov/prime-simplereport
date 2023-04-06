#!/bin/bash

curl -s -f -X POST http://localhost:8088/__admin/shutdown

echo 'Stopped Wiremock.'