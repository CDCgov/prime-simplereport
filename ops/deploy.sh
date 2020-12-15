#!/bin/sh
#
# ./deploy.sh (frontend|backend) (dev|demo|beta)

git checkout main && git pull origin main

if [ "$1" == "frontend" ]; then
  cd ../$1 && yarn

  if [ "$2" == "dev" ]; then
    yarn deploy-azure-dev
  elif [ "$2" == "demo" ]; then
    yarn deploy-azure-demo
  elif [ "$2" == "beta" ]; then
    yarn deploy-azure-beta
  fi
elif [ "$1" == "backend" ]; then
  cd ../$1

  docker-compose down
  docker-compose up --build -d
fi

