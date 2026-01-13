FROM cypress/browsers:node-24.12.0
LABEL org.opencontainers.image.source=https://github.com/CDCgov/prime-simplereport

RUN apt-get update
RUN apt-get install --no-install-recommends -y curl

ADD ./cypress /app/cypress
RUN mkdir -p /app/cypress/screenshots
RUN mkdir -p /app/cypress/videos
COPY ./cypress/cypress.config.js /app/cypress.config.js
COPY ./cypress/package.json /app/package.json
COPY ./cypress/yarn.lock /app/yarn.lock

WORKDIR /app

RUN CYPRESS_CACHE_FOLDER=./tmp/Cypress yarn install

COPY ./cypress/e2e.sh /app/e2e.sh

ENTRYPOINT [ "./e2e.sh" ]
