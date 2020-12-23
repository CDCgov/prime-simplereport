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
  echo "Deploying the static landing page to $1"
  sed -i 's,https://hhs-prime.okta.com/oauth2/default/v1/authorize?client_id=0oa5ahrdfSpxmNZO74h6&amp;response_type=token+id_token&amp;scope=openid&amp;scope=simple_report&amp;redirect_uri=https://simplereport.cdc.gov/app&amp;nonce=thisisnotsafe&amp;state=thisisbogus,https://demo.simplereport.gov/app,' _site/index.html
  az storage blob upload-batch -s _site/ -d '$web' --account-name simplereportdemoapp --destination-path '/'
fi