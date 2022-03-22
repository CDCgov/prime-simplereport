FROM cypress/browsers:node14.17.0-chrome91-ff89
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

# Install OpenJDK-11
RUN apt-get update && \
    apt-get install -y openjdk-11-jdk && \
    apt-get install -y ant && \
    apt-get clean;

ADD ./ /app/cypress
RUN mkdir -p /app/cypress/screenshots
RUN mkdir -p /app/cypress/videos
COPY ./cypress.json /app/cypress.json
COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

WORKDIR /app

RUN yarn install

COPY ./e2e.sh /app/e2e.sh

ENTRYPOINT [ "./e2e.sh" ]
