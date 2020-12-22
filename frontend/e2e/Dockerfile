FROM node:12

WORKDIR /app

RUN npm install nightwatch geckodriver chromedriver dayjs faker

COPY nightwatch.conf.js nightwatch-entrypoint.bash ./
