# Simple Report

https://simplereport.gov/

[![Latest release](https://shields.io/github/v/release/cdcgov/prime-simplereport)](https://github.com/CDCgov/prime-simplereport/releases/latest) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=CDCgov_prime-data-input-client&metric=alert_status)](https://sonarcloud.io/dashboard?id=CDCgov_prime-data-input-client) [![Sonar coverage](https://shields.io/sonar/coverage/CDCgov_prime-data-input-client?server=https://sonarcloud.io)](https://sonarcloud.io/dashboard?id=CDCgov_prime-data-input-client)

## Table of Contents

- [Simple Report](#simple-report)
  - [Table of Contents](#table-of-contents)
  - [Setup](#setup)
  - [Backend](#backend)
    - [Backend-Setup](#backend-setup)
    - [Running the app with Make or start.sh](#running-the-app-with-make-or-startsh)
    - [Updating user role](#updating-user-role)
      - [Organization roles](#organization-roles)
      - [Site roles](#site-roles)
    - [Restart & Clean](#restart--clean)
    - [API Testing](#api-testing)
    - [Tests](#tests)
    - [E2E Tests](#e2e-tests)
    - [Local Settings](#local-settings)
    - [SchemaSpy](#schemaspy)
    - [Twilio](#twilio)
  - [Frontend](#frontend)
    - [Frontend-Setup](#frontend-setup)
    - [Linters](#linters)
    - [Storybook](#storybook)
  - [Deploy](#deploy)
    - [Cloud Environments](#cloud-environments)
    - [Deploy With Release](#deploy-with-release)
    - [Revert to a Previous Release](#revert-to-a-previous-release)
    - [Deploy With Action](#deploy-with-action)

## Setup

1. Install Docker and docker-compose
   - You can install docker hub directly: https://hub.docker.com/. This is the preferred solution and should come with docker-compose
   - Alternatively, you can install docker and run it as a daemon: `brew install docker docker-compose`.

## Backend

There are two major pieces:

- a Java Spring Boot application
- a postgresql database

To run the service, you need a JDK and some way of running postgresql (most
people choose to use Docker, but you can also just run it as a service on your
development box.) To test the full authentication/authorization/user-management
integration, you will also need Okta credentials, but that is not necessary
most of the time.

### Backend-Setup

If Java isn't installed on a Mac you can get it from `brew`:

```sh
brew tap adoptopenjdk/openjdk
brew cask install adoptopenjdk11
brew install gradle
```

Another option (also compatible with Linux) is to install with [jabba](https://github.com/shyiko/jabba), the Java version manager:

```sh
curl -sL https://github.com/shyiko/jabba/raw/master/install.sh | bash && . ~/.jabba/jabba.sh
jabba install adopt@1.11-0
jabba use adopt@1.11
```

Running with docker:

1. `cd backend`
1. Run `docker-compose up --build`
1. view site at http://localhost:8080

Running spring app locally and db in docker

1. `cd backend`
1. Run `docker-compose up -d db`
1. Run `./gradlew bootRun --args='--spring.profiles.active=dev'`
1. view site at http://localhost:8080

Running spring app locally and db in docker on port 5433

1. `cd backend`
1. Run ` docker-compose --env-file .env.development up db`
1. Run ` SR_DB_PORT=5433 ./gradlew bootRun --args='--spring.profiles.active=dev'`
1. view site at http://localhost:8080

### Running the app with Make or start.sh

For development, it may be more convenient to start the front and backends simultaneously. This can be done by running the following command in the root directory of the project:

```bash
make # "make start" if you're nasty
```

This will start up both servers in "watch" mode, so that changes to the source
code result in an immediate rebuild.

If you'd like to use a local installation of PostgreSQL, run the following to create a local database:

```bash
# Run this to create or reset the local db. Assumes your $USER has superuser privileges.
# If not, use POSTGRES_USER=postgres
POSTGRES_USER=$USER LIB_DIR="$(pwd)/backend/db-setup" POSTGRES_DB=postgres ./backend/db-setup/create-db.sh
```

Then run this to start the app:

```bash
./start.sh
```

This will also start up both servers in "watch" mode.  When using `start.sh`, any environment variables put
in `.env` in the root directory will be available to the app. Press CTRL-C to exit and cleanup the servers cleanly.

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

current role types are `ADMIN`, `USER`, `ENTRY_ONLY`, `ALL_FACILITIES`, and `NO_ACCESS`. You can check `backend/src/main/java/gov/cdc/usds/simplereport/config/authorization/OrganizationRole.java` for a list of available roles

`ADMIN` - an organization admin with full access to their organization
`USER` - a site user the has access to everything in their organization but the gear icon
`ENTRY_ONLY` - a site user that only has access to the Conduct Test tab
`ALL_FACILITIES` - a site user that can access all facilities in their organization
`NO_ACCESS` - a member of an organization who has no permissions without possessing other roles

#### Site roles

You can make the default user a site admin by adding the following to `application-local.yaml`:

```
simple-report:
  demo-users:
    site-admin-emails:
      - bob@example.com
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
yarn e2e
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
  demo-users:
    site-admin-emails:
      - bob@example.com
```

- make SQL pretty

```
spring:
  jpa:
    properties:
      hibernate:
        format_sql: true
```

- set CORS allowed-origins (this can be useful for testing the Okta integration)

```
simple-report:
  cors:
    allowed-origins:
      - http://localhost:3000
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

### Twilio

Twilio's Java SDK auto-configures based on two environment variables: `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`. SMS is also disabled by default, and can be enabled in application.yml:

```
twilio:
  enabled: true
  from-number: +13214560987
```

These can also be set by environment variable if desired.

## Frontend

The front end is a React app. The app uses [Apollo](https://www.apollographql.com/) to manage the graphql API. For styling the app leverages the [U.S. Web Design System (USWDS)](https://designsystem.digital.gov/)

### Frontend-Setup

1. Install [nvm](https://github.com/nvm-sh/nvm)
1. (optional) Install react developer tools extensions
1. Install [yarn](https://classic.yarnpkg.com/en/docs/install)
1. `cd frontend && nvm use && yarn install`
1. `yarn start`
1. view site at http://localhost:3000
   - Note: frontend need the backend to be running to work

### Linters

This project uses [eslint](https://eslint.org/), [prettier](https://prettier.io/), and [stylelint](https://stylelint.io/) as frontend linters,
and [spotless](https://github.com/diffplug/spotless) and [google-java-format](https://github.com/google/google-java-format) for the backend.
GitHub Actions is configured to run these linters on every pull request, so you must resolve all mismatches/errors prior to merging.
There are a few ways to manage this:

1. Run `yarn lint:write` in the `frontend/` dir, and `./gradlew spotlessApply` in the `backend/` dir, before every commit
1. Enable the optional pre-commit hook by running `yarn install` in the root dir
1. Add extensions to your code editor that runs the linters for you on save, e.g. [prettier-vscode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), [vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), [vscode-google-java-format](https://marketplace.visualstudio.com/items?itemName=ilkka.google-java-format)

### Storybook and Chromatic

[Storybook](https://storybook.js.org/) is an open source tool for developing UI components in isolation for React. It makes building UIs organized and efficient.

To view the Storybook locally:

- Run `yarn storybook` in the `frontend/` dir
- Visit http://localhost:6006

[Chromatic](https://www.chromatic.com/) is a web-based tool for Storybook that helps speed UI
component development.  It provides regression testing and review.  It also allows for publication
of the Storybook.

Changes to the Storybook are sent to Chromatic when changes to the frontend source are push to a
any branch.  The changes are automatically accepted on merge to `main`.

View the [SimpleReport Storybook](https://main--60a556a7c807cc0039ec6786.chromatic.com/)

## Deploy

### Cloud Environments

**Type**|**Frontend**|**API**|**Deployment**
:-----:|:-----:|:-----:|:-----:
Prod|[/app/static/commit.txt](https://simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://simplereport.gov/api/actuator/info)|[Release](#deploy-with-release)
Demo|[/app/static/commit.txt](https://demo.simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://demo.simplereport.gov/api/actuator/info)|[Release](#deploy-with-release) & [Action](#deploy-with-action)
Training|[/app/static/commit.txt](https://training.simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://training.simplereport.gov/api/actuator/info)|[Release](#deploy-with-release) & [Action](#deploy-with-action)
Staging|[/app/static/commit.txt](https://stg.simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://stg.simplereport.gov/api/actuator/info)|[Action](#deploy-with-action) & Daily cron
Dev|[/app/static/commit.txt](https://dev.simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://dev.simplereport.gov/api/actuator/info)|Push to `main`
Test|[/app/static/commit.txt](https://test.simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://test.simplereport.gov/api/actuator/info)|[Action](#deploy-with-action)
Pentest|[/app/static/commit.txt](https://pentest.simplereport.gov/app/static/commit.txt)|[/api/actuator/info](https://pentest.simplereport.gov/api/actuator/info)|[Release](#deploy-with-release) & [Action](#deploy-with-action)

### Deploy With Release

Navigate to [New Release Form](https://github.com/CDCgov/prime-simplereport/releases/new) page

![full-dialog](https://user-images.githubusercontent.com/28784751/121424756-b31bd380-c93f-11eb-987d-38934f0570ae.png)

1. <img align="right" width="517" alt="select-commit" src="https://user-images.githubusercontent.com/28784751/121423065-df365500-c93d-11eb-9b95-a63130d602e6.png">
   Select the commit you want to release. This is likely to be the last commit on `main`, but select
   the commit explicitly so that you do not accidentally release changes that somebody else is in the
   process of merging.<br clear="right" />
2. <img align="right" width="399" alt="new-release-name" src="https://user-images.githubusercontent.com/28784751/121423127-f07f6180-c93d-11eb-9e76-53aa5187a633.png">
   Add a version tag. If the release was `v1` then this release should be `v2` 
2. Add a release title summarizing the changes
3. If applicable describe some of the changes in detail in the description
3. Check the "This is a pre-release" box.
4. Click publish release (this will trigger the release to `stg`)
5. Verify the changes are live in `stg` by ensuring the deployed commit hash matches the commit hash on the release and the deployed release tag matches. This is done by going to `/app/static/commit.txt` and `/api/actuator/info`
6. Return to the release page and select "Edit release"
7. Un-check the "This is a pre-release" checkbox and click "Update release" (this will trigger the release to other environments)
8. Verify that the changes are live in `prod`, `demo` and `training`.

### Revert to a Previous Release

1. Find the version tag for the release you want to revert to.
2. Select that release from the list on the [release page](https://github.com/CDCgov/prime-simplereport/releases) (or navigate directly to `https://github.com/CDCgov/prime-simplereport/releases/tag/{TAG}`)
3. Click "Edit Release"
4. Check the "This is a pre-release" box
5. Click "Update release"
6. Verify that the original changes have been re-released successfully on `stg`
7. Edit the release again, de-select the "This is a pre-release" box, and click "Update release."
9. Verify the changes are live by ensuring the deployed commit hash matches the commit hash on the release. This is done by going to `/app/static/commit.txt` and `/api/actuator/info`


### Deploy With Action

Navigate to the [Github Actions Tab](https://github.com/CDCgov/prime-simplereport/actions)
![Screen Shot 2021-02-24 at 11 07 13 AM](https://user-images.githubusercontent.com/53869143/109029807-36673100-7691-11eb-81d1-a474517c1eb6.png)
1. Select the environment you want to deploy to from the workflows list on the left. In this case we are selecting the `test` environment
2. Click the "Run workflow" button
3. Select the branch you want to deploy. In this case we are deploying the latest commit on `main`
4. Click the green "Run workflow" button.
5. After the workflow is completed you can verify the changes are live by Checking the deployed commit hash. This is done my going to `/app/static/commit.txt` and `/api/actuator/info`
