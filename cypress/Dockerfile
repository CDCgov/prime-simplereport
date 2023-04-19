FROM cypress/browsers:node14.17.0-chrome91-ff89
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

RUN apt-get install -y wget apt-transport-https libwoff1 libopus0 libwebp6 libwebpdemux2 libenchant1c2a libgudev-1.0-0 libsecret-1-0 libhyphen0 libgdk-pixbuf2.0-0 libegl1 libnotify4 libxslt1.1 libevent-2.1-6 libgles2 libgl1 libvpx5 libnss3 libxss1 libasound2 libdbus-glib-1-2 libxt6; \
    mkdir -p /etc/apt/keyrings; \
    wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | tee /etc/apt/keyrings/adoptium.asc; \
    echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list; \
    apt-get update; \
    apt-get upgrade; \
    apt-get install -y temurin-17-jdk; \
    apt-get install -y ant; \
    apt-get clean; \

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
