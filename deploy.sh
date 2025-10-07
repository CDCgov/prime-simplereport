#!/bin/sh

GIT_SHA=$(git rev-parse --short HEAD)
git pull

if [ $(git tag -l "$GIT_SHA") ]; then
    echo "Tag already exists."
else
    git checkout main
    git pull origin main
    git tag $GIT_SHA
    git push origin $GIT_SHA
fi

if [ "$1" == "demo" ]; then
  git checkout demo
  git reset --hard $GIT_SHA
  git push origin demo
fi