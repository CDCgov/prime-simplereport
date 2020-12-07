# Simple Report

https://simplereport.cdc.gov/

## Table of Contents

- [Setup](#setup)
- [Backend](#backend)
  - [Setup](#backend-Setup)
  - [Restart & Clean](#restart-&-clean)
  - [API Testing](#api-testing)
- [Frontend](#frontend)
  - [Setup](#frontend-Setup)
- [Deploy](#Deploy)

## Setup

1. Install Docker and docker-compose
   - You can install docker hub directly: https://hub.docker.com/. This is the preferred solution and should come with docker-compose
   - Alternatively, you can install docker and run it as a daemon: `brew install docker`.

## Backend

There are two major pieces:

- Java Spring
- Postgres

To run the service, you needs a DB and a connection to Okta for it to work. Locally, you can disable authentication, but you still need the database running locally.

### Backend-Setup

If Java isn't installed on a Mac you can get it from `brew`:

```sh
brew tap adoptopenjdk/openjdk
brew cask install adoptopenjdk8
brew install gradle
```

Running with docker:

1. `cd backend`
1. Run `docker-compose up --build`
1. view site at http://localhost:8080

Running spring app locally and db in docker

1. `cd backend`
1. Run `docker-compose up db`
1. Run `gradle bootRun --args='--spring.profiles.active=dev'`
1. view site at http://localhost:8080

Running spring app locally and db in docker on port 5433

1. `cd backend`
1. Run ` docker-compose --env-file .env.development up db`
1. Run ` SR_DB_PORT=5433 gradle bootRun --args='--spring.profiles.active=dev'`
1. view site at http://localhost:8080

## Restart & Clean

When there are DB schema changes the backend may throw and error and fail to start.

Restarting the docker way:

1. run `cd backend`
1. Bring down the service by running `docker-compose down`
1. Wipe the db by running `docker system prune && docker images prune && docker volumes prune`
1. Restart the service `docker-compose up --build`

Restarting the SQL way:

1. run `db-setup/nuke-db.sh`
2. restart the spring app `gradle bootRun --args='--spring.profiles.active=dev'`

## API Testing

Go to `localhost:8080` to see interact with the graphql api. You would need to point the api endpoint to the backend at: `http://localhost:8080/graphql` This gives you a preview to query/mutate the local database.

## Frontend

The frontend is a React app. The app uses [Apollo](https://www.apollographql.com/) to manage the graphql API. For styling the app leverages the [U.S. Web Design System (USWDS)](https://designsystem.digital.gov/)

### Frontend-Setup

1. Install [nvm](https://github.com/nvm-sh/nvm)
1. (optional) Install react developer tools extensions
1. `cd frontend && nvm use && npm install`
1. `npm run start`
1. view site at http://localhost:3000
   - Note: frontend need the backend to be running to work

## Deploy

See https://github.com/usds/prime-simplereport-docs/blob/main/azure/manual-app-deploy.md
