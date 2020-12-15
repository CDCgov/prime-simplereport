#!/bin/sh
#
# ./health_check.sh (dev|demo)

echo -n "$1.simplereport.org:                  "
curl -s "https://$1.simplereport.org/" | grep "<title>" | awk -F"<title>" '{print $2}' | awk -F"<" '{print $1}'
echo -n "$1.simplereport.org/app:              "
curl -s "https://$1.simplereport.org/app/" | grep "<title>" | awk -F"<title>" '{print $2}' | awk -F"<" '{print $1}'
echo -n "$1.simplereport.org/app/organization/123/queue: "
curl -s "https://$1.simplereport.org/app/organization/123/queue" | grep "<title>" | awk -F"<title>" '{print $2}' | awk -F"<" '{print $1}'
echo -n "$1.simplereport.org/api/actuator/health:              "
curl -s "https://$1.simplereport.org/api/actuator/health"
echo ""
echo ""