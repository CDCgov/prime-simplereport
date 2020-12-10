#!/bin/sh
#
# ./health_check.sh (dev|demo)

echo -n "$1.simplereport.org:                  "
curl -s "http://$1.simplereport.org/" | grep "<title>" | awk -F"<title>" '{print $2}' | awk -F"<" '{print $1}'
echo -n "$1.simplereport.org/app:              "
curl -s "http://$1.simplereport.org/app/" | grep "<title>" | awk -F"<title>" '{print $2}' | awk -F"<" '{print $1}'
echo -n "$1.simplereport.org/app/organization: "
curl -s "http://$1.simplereport.org/app/organization/123/queue" | grep "<title>" | awk -F"<title>" '{print $2}' | awk -F"<" '{print $1}'
echo -n "$1.simplereport.org/api:              "
curl -s "http://$1.simplereport.org/api/actuator/health"
echo ""
echo ""