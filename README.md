# Simple Report

https://simplereport.gov/

## Table of Contents

- [Simple Report](#simple-report)
  - [Table of Contents](#table-of-contents)
  - [Setup](#setup)
  - [Backend](#backend)
    - [Backend-Setup](#backend-setup)
    - [Running the app with Make](#running-the-app-with-make)
    - [Updating user role](#updating-user-role)
      - [Organization roles](#organization-roles)
      - [Site roles](#site-roles)
    - [Restart & Clean](#restart--clean)
    - [API Testing](#api-testing)
    - [Tests](#tests)
    - [E2E Tests](#e2e-tests)
    - [Local Settings](#local-settings)
    - [SchemaSpy](#schemaspy)
  - [Frontend](#frontend)
    - [Frontend-Setup](#frontend-setup)
  - [Deploy](#deploy)
    - [Cloud Environments](#cloud-environments)
    - [Manually-trigger-deploy](#manually-trigger-deploy)

## Setup

1. Install Docker and docker-compose
   - You can install docker hub directly: https://hub.docker.com/. This is the preferred solution and should come with docker-compose
   - Alternatively, you can install docker and run it as a daemon: `brew install docker docker-compose`.

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
1. Run `docker-compose up -d db`
1. Run `gradle bootRun --args='--spring.profiles.active=dev'`
1. view site at http://localhost:8080

Running spring app locally and db in docker on port 5433

1. `cd backend`
1. Run ` docker-compose --env-file .env.development up db`
1. Run ` SR_DB_PORT=5433 gradle bootRun --args='--spring.profiles.active=dev'`
1. view site at http://localhost:8080

### Running the app with Make

For development, it may be more convenient to start the front and backends simultaneously. This can be done by running the following command in the root directory of the project:

```bash
make start
```

### Updating user role

By default the local test user is an organization admin role. If you need to change this value to test out other permissions.
It can be set in `application-local.yaml`. If you have not created one run:

bash

```
touch backend/src/main/resources/application-local.yaml
```

#### Organization roles

Organization roles can be set by adding the following to `application-local.yaml`:

```
simple-report:
  demo-users:
    default-user:
      authorization:
        granted-roles: ADMIN
```

current role types are `ADMIN`, `USER`, and `ENTRY_ONLY`. You can check `backend/src/main/java/gov/cdc/usds/simplereport/config/authorization/OrganizationRole.java` for a list of available roles

`ADMIN` - an organization admin with full access to their organization
`USER` - a site user the has access to everything in their organization but the gear icon
`ENTRY_ONLY` - a site user that only has access to the Conduct Test tab

#### Site roles

You can make the default user a site admin by adding the following to `application-local.yaml`:

```
simple-report:
  site-admin-emails:
    - bob@sample.com
```

Site admins can access the `/admin` paths and site admin APIs

### Restart & Clean

When there are DB schema changes the backend may throw an error and fail to start.

Restarting the docker way:

1. run `cd backend`
1. Bring down the service by running `docker-compose down`
1. Wipe the db by running `docker system prune && docker images prune && docker volume prune`
1. Restart the service `docker-compose up --build`

Restarting the SQL way:

1. run `db-setup/nuke-db.sh`
2. restart the spring app `gradle bootRun --args='--spring.profiles.active=dev'`

### API Testing

Go to `localhost:8080` to see interact with the graphql api. You would need to point the api endpoint to the backend at: `http://localhost:8080/graphql` This gives you a preview to query/mutate the local database.

### Tests

All the tests can be run with `gradle test`. Make sure that you do not have `SPRING_PROFILES_ACTIVE` set in your shell environment.

Running a single test with a full stacktrace can be accomplished by supping the path to `gradle test`. Example

```bash
gradle test --tests gov.cdc.usds.simplereport.api.QueueManagementTest.updateItemInQueue --stacktrace
```

### E2E Tests

E2E/Integration tests are available using [Nightwatch.js](https://nightwatchjs.org/).

Run them with the following commands while the app (both front and backends) is already running:

```bash
cd frontend
npm run e2e
```

### Local Settings

to edit Spring boot settings for your local set up you must first create a `application-local.yaml`
(note this file is git ignored):

bash

```
touch backend/src/main/resources/application-local.yaml
```

Useful local settings

- make the default user an admin

```
simple-report:
  site-admin-emails:
    - bob@sample.com
```

- make SQL pretty

```
spring:
  jpa:
    properties:
      hibernate:
        format_sql: true
```
- enable the patient links QR code feature flag
```
simple-report:
  feature-flags:
    patient-links: true
```

### SchemaSpy

http://schemaspy.org/

```bash
cd backend
docker-compose up db
docker-compose up --build schemaspy
# to run on a different port than 8081
SR_SCHEMASPY_PORT=8082 docker-compose up --build schemaspy
```

visit http://localhost:8081

## Frontend

The frontend is a React app. The app uses [Apollo](https://www.apollographql.com/) to manage the graphql API. For styling the app leverages the [U.S. Web Design System (USWDS)](https://designsystem.digital.gov/)

### Frontend-Setup

1. Install [nvm](https://github.com/nvm-sh/nvm)
1. (optional) Install react developer tools extensions
1. Install [yarn](https://classic.yarnpkg.com/en/docs/install)
1. `cd frontend && nvm use && yarn install`
1. `yarn start`
1. view site at http://localhost:3000
   - Note: frontend need the backend to be running to work

## Deploy
See https://github.com/usds/prime-simplereport-docs/blob/main/azure/manual-app-deploy.md

### Cloud Environments

**Type**|**Frontend**|**API**|**Deployment**|**How to trigger**
:-----:|:-----:|:-----:|:-----:
Prod|[/app/static/commit.txt](https://simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://simplereport.gov/api/actuator/info)|Manual|[Github Actions](#manually-trigger-deploy)
Demo|[/app/static/commit.txt](https://demo.simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://demo.simplereport.gov/api/actuator/info)|Automed on deploy to prod|[Github Actions](#manually-trigger-deploy)
Training|[/app/static/commit.txt](https://training.simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://training.simplereport.gov/api/actuator/info)|Automed on deploy to prod|[Github Actions](#manually-trigger-deploy)
Staging|[/app/static/commit.txt](https://stg.simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://stg.simplereport.gov/api/actuator/info)|Manual & Daily cron|[Github Actions](#manually-trigger-deploy)
Dev|[/app/static/commit.txt](https://dev.simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://dev.simplereport.gov/api/actuator/info)|Automed on merge to `main`|[Github Actions](#manually-trigger-deploy)
Test|[/app/static/commit.txt](https://test.simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://test.simplereport.gov/api/actuator/info)|Manual|[Github Actions](#manually-trigger-deploy)
Pentest|[/app/static/commit.txt](https://pentest.simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://pentest.simplereport.gov/api/actuator/info)|Manual|[Github Actions](#manually-trigger-deploy)
Prod|[/app/static/commit.txt](https://simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://simplereport.gov/api/actuator/info)|Manual|[Github Actions](#manually-trigger-deploy)

### Manually-trigger-deploy

1. Navigate to the [Github Actions Tab](https://github.com/CDCgov/prime-simplereport/actions)
2. Select the environment you want to deploy to from the workflows list. In this case we are selecting the `dev` environment
![Select-dev](https://user-images.githubusercontent.com/53869143/108391209-78026280-71df-11eb-8cab-2d124f71627e.png)
1. Click the "Run workflow" button, select the branch you want to deploy and click the green "Run workflow" button. In this case we are deploying the latest commit on `main` to `dev`
2. ![select branch](https://user-images.githubusercontent.com/53869143/108391056-4c7f7800-71df-11eb-9d41-4c20fa5828e9.png)
3. After the workflow is completed you can verify the changes are live by Checking the deployed commit hash. This is done my going to `/app/static/commit` and `/api/actuator/info`