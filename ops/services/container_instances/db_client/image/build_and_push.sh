#!/bin/sh
#
# ./build_and_push.sh

# Increment this version only if the container has undergone a major change.
# Ensure this version is also updated in the infra folder, within db_client.tf.
ACR_TAG="simplereportacr.azurecr.io/api/simple-report-db-client:2.0.0"

export DOCKER_CLI_EXPERIMENTAL=enabled # to get "manifest inspect"

if docker manifest inspect $ACR_TAG > /dev/null 2>&1; then
    echo "Built image for ${GIT_SHA} already exists in the repository"
    exit 0
fi

echo "Building backend images"
docker compose -f ${DOCKER_COMPOSE_FILE:-docker-compose.yml} build

docker tag "simple-report-db-client:latest" $ACR_TAG
echo "Tagged $ACR_TAG"

# Log in to ACR
# Uncomment for user login
# az acr login --name simplereportacr
docker push $ACR_TAG
