FROM cypress/browsers:node-18.16.1-chrome-114.0.5735.133-1-ff-114.0.2-edge-114.0.1823.51-1
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

RUN apt-get update
RUN apt-get install --no-install-recommends -y curl

ADD ./cypress /app/cypress
RUN mkdir -p /app/cypress/screenshots
RUN mkdir -p /app/cypress/videos
COPY ./cypress/cypress.config.js /app/cypress.config.js
COPY ./cypress/package.json /app/package.json
COPY ./cypress/yarn.lock /app/yarn.lock

WORKDIR /app

RUN yarn install

COPY ./cypress/e2e.sh /app/e2e.sh

ENTRYPOINT [ "./e2e.sh" ]
