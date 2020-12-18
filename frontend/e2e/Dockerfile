FROM node:12

WORKDIR /app

RUN npm install nightwatch geckodriver chromedriver lorem-ipsum speakeasy

COPY nightwatch.conf.js nightwatch-entrypoint.bash ./
