printf 'Waiting for wiremock to start...'
curl -k http://localhost:8088 > /dev/null 2>&1
result=$?

polls=0
while [[ $result -ne 0 && $polls -lt 180 ]]; do
  ((polls++))
  printf .
  sleep 1
  curl -k http://localhost:8088 > /dev/null 2>&1
  result=$?
done
echo

echo 'Wiremock is online! Starting Nightwatch tests...'