FROM cypress/browsers:node14.17.0-chrome91-ff89
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

RUN apt-get install -y wget apt-transport-https; \
    mkdir -p /etc/apt/keyrings; \
    wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | tee /etc/apt/keyrings/adoptium.asc; \
    echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list; \
    apt-get update; \
    apt-get upgrade; \
    apt-get install -y temurin-17-jdk; \
    apt-get install -y ant; \
    apt-get clean;

ADD ./cypress /app/cypress
RUN mkdir -p /app/cypress/screenshots
RUN mkdir -p /app/cypress/videos
COPY ./cypress.json /app/cypress.json
COPY ./cypress/package.json /app/package.json
COPY ./cypress/yarn.lock /app/yarn.lock

WORKDIR /app

RUN yarn install

COPY ./cypress/e2e.sh /app/e2e.sh
RUN echo "$(java -version)"
RUN echo $JAVA_HOME
RUN echo "$(ls /usr/lib/jvm/)"
ENV JAVA_HOME /usr/lib/jvm/temurin-17-jdk-amd64/
RUN export JAVA_HOME



ENTRYPOINT [ "./e2e.sh" ]
