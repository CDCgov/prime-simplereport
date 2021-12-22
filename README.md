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
    - [Running locally with Okta](#running-locally-with-okta)
    - [Updating user role](#updating-user-role)
      - [Organization roles](#organization-roles)
      - [Site roles](#site-roles)
    - [Restart & Clean](#restart--clean)
    - [Rollbacks](#rollbacks)
    - [API Testing](#api-testing)
    - [Tests](#tests)
    - [E2E Tests](#e2e-tests)
    - [Local Settings](#local-settings)
    - [SchemaSpy](#schemaspy)
    - [Twilio](#twilio)
    - [MailHog](#MailHog)
  - [Frontend](#frontend)
    - [Frontend-Setup](#frontend-setup)
    - [Linters](#linters)
    - [Storybook and Chromatic](#storybook-and-chromatic)
  - [PR Conventions](#pr-conventions)
  - [Cloud Environments](#cloud-environments)
  - [Deploy](#deploy)
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
brew install --cask adoptopenjdk11
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

The GraphQL playground should load after replacing the default request url with
`http://localhost:8080/graphql`

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

This will also start up both servers in "watch" mode. When using `start.sh`, any environment variables put
in `.env` in the root directory will be available to the app. Press CTRL-C to exit and cleanup the servers cleanly.

### Running locally with Okta

You can run the app against the "Okta Preview" instance by running the backend with the `okta-local` Spring profile. Be sure to set the `OKTA_API_KEY` environment variable. You can generate an API token for yourself by logging into the Okta Preview [admin panel](https://hhs-prime-admin.oktapreview.com) and going into Security > API > Tokens.

You also need to set the following in `frontend/.env.local`:

```
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_BASE_URL=http://localhost:3000
REACT_APP_OKTA_ENABLED=true
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

### Rollbacks

The application uses the Liquibase plugin for Gradle to perform certain database management tasks.

To roll the database back to its state at a prior date:

```
$ ./gradlew liquibaseRollbackToDate -PliquibaseCommandValue=${date}
```

To roll back a certain _number_ of migrations:

```
$ ./gradlew liquibaseRollbackCount -PliquibaseCommandValue=${n}
```

To roll back to a certain tag:

```
$ ./gradlew liquibaseUpdateToTag -PliquibaseCommandValue=${TAG}
```

If you are required to roll back a non-local database, you may generate the required SQL to execute elsewhere. Use `liquibaseRollbackToDateSQL` or `liquibaseRollbackCountSQL` in the manner described above to write the rollback SQL to stdout.

### API Testing

Go to `localhost:8080` to see interact with the graphql api. You would need to point the api endpoint to the backend at: `http://localhost:8080/graphql` This gives you a preview to query/mutate the local database.

### Tests

All the tests can be run with `gradle test`. Make sure that you do not have `SPRING_PROFILES_ACTIVE` set in your shell environment.

Running a single test with a full stacktrace can be accomplished by supping the path to `gradle test`. Example

```bash
gradle test --tests gov.cdc.usds.simplereport.api.QueueManagementTest.updateItemInQueue --stacktrace
```

### Local Settings

To edit Spring Boot settings for your local set up you must first create a `application-local.yaml`
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

To edit React settings, create `frontend/.env.local` (also git ignored).

### E2E Tests

E2E/Integration tests are available using [Cypress](https://www.cypress.io/).

To get started, you'll need to get the secrets listed in `frontend/cypress/.env.e2e.sample`. Reach out to another developer if you don't have them already, and place them in `frontend/cypress/.env.e2e`.

To run the tests the easy way, simply run `yarn e2e`. This will spin up the app with all the necessary configuration in a docker compose network and run the tests headlessly in firefox. Screenshots and videos from the test will be saved to `frontend/cypress/screenshots` and `frontend/cypress/videos`.

In order to run the tests locally, some modifications will need to be made to your local environment. Spring session requires the frontend and backend to be hosted on the same domain in order to properly authenticate.

First, the tests run best on a clean database, so empty out your database prior to running.

Next, before starting up the app, you'll need to start Wiremock:

```
cd frontend
./cypress/support/wiremock/download-wiremock.sh
./cypress/support/wiremock/start-wiremock.sh orgSignUp
```

The following settings are needed for the frontend:

`frontend/.env.local`:
```
REACT_APP_BASE_URL=http://localhost.simplereport.gov
REACT_APP_BACKEND_URL=http://localhost.simplereport.gov/api
REACT_APP_OKTA_ENABLED=true
REACT_APP_OKTA_URL=http://localhost:8088
```

You will need to run the backend with the `e2e` profile, and with the following environment variable:
```bash
OKTA_TESTING_DISABLEHTTPSCHECK=true ./gradlew bootRun --args='--spring.profiles.active=e2e'
```

Or, if you are running with the `start.sh` script:  
  
`backend/src/main/resources/application-local.yaml`
```
spring.profiles.include: no-security, no-okta-mgmt, server-debug, create-sample-data
server.servlet.session.cookie.domain: localhost.simplereport.gov
okta.client.org-url: http://localhost:8088
okta.client.token: foo
```
```bash
OKTA_TESTING_DISABLEHTTPSCHECK=true ./start.sh
```

In order for `http://localhost.simplereport.gov` to route to your local application server, you'll need to make the following addition to your `/etc/hosts` file:

`/etc/hosts`
```
127.0.0.1 localhost.simplereport.gov
```

Finally, you'll need to run a reverse proxy like nginx to point port 80 at your application server. You can do this in a docker container with the following command:


```bash
docker build -t nginx -f .frontend/cypress/support/nginx/Dockerfile.nginx.docker . && docker run -d -p 80:80 nginx:latest
```

If you are running nginx locally already, you can use the config located at `frontend/cypress/support/nginx/localhost.simplereport.gov`. 

Once all of that is done, you are are ready for a test run! There are a few ways to run the tests (from the `frontend` dir):
- `yarn cypress open` 
  - this will open an interactive test runner that lets you select browsers and which test to run. tests will run headed by default
- `yarn cypress run`
  - this will run all the tests headlessly on the commandline using electron
- `yarn cypress run --browser firefox`
  - this will run all the tests headlessly on the commandline using firefox
- `yarn cypress run --browser chrome --headed`
  - this will run all the tests headed using chrome  
  
To write new tests, see the [Cypress documentation](https://docs.cypress.io/api/table-of-contents). If you need to generate new Wiremock mappings for external services, see [this wiki page](https://github.com/CDCgov/prime-simplereport/wiki/WireMock).

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

### MailHog

MailHog is an email-testing tool with a fake SMTP server underneath, we can use it to test sending emails locally.

- Mailhog client runs on docker, `docker-compose up -d mailhog`
- add the following to `application-local.yaml` to configure the backend to send email to mailhog client

```yml
spring:
  mail:
    host: localhost
    port: 1025
```

- Access mailhog inbox on `http://localhost:8025/`

## Frontend

The front end is a React app. The app uses [Apollo](https://www.apollographql.com/) to manage the graphql API. For styling the app leverages the [U.S. Web Design System (USWDS)](https://designsystem.digital.gov/). Ensure your node version is version 14 in order for
yarn to build packages correctly.

### Frontend-Setup

1. (optional) Install react developer tools extensions
1. Install [yarn](https://classic.yarnpkg.com/en/docs/install)
1. `cd frontend && yarn install && docker-compose up`
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
component development. It provides regression testing and review. It also allows for publication
of the Storybook.

Changes to the Storybook are sent to Chromatic when changes to the frontend source are push to a
any branch. The changes are automatically accepted on merge to `main`.

View the [SimpleReport Storybook](https://main--60a556a7c807cc0039ec6786.chromatic.com/)

## PR Conventions
The convention for branch naming on this project is {firstName}/{ticketNumber}-{short-description}. This makes it easier for other developers to find your changes.

If you're merging large or complex changes, it is strongly recommended that you smoke test them in `dev`, `test`, or `pentest`. These three environments are roughly the same, with small configuration changes between each (`test` sends text results for pxp while `dev` and `pentest` do not, for example.)

For all changes, please ensure the PR checklist is completed before sending out for review. If you're making UI changes, make sure to screenshot and get approval from a designer or product manager, in addition to engineers.

We require two reviewers per changeset, and you cannot merge until all commits have been reviewed.

## Cloud Environments

| **Name** |                                   **Frontend**                                    |                                  **API**                                  |            **Deployment**             |                                **Intended Use**                                |
| :------: | :-------------------------------------------------------------------------------: | :-----------------------------------------------------------------------: | :-----------------------------------: | :----------------------------------------------------------------------------: |
|   prod   |     [/app/static/commit.txt](https://simplereport.gov/app/static/commit.txt)      |     [/api/actuator/info](https://simplereport.gov/api/actuator/info)      | Dispatched on success of `stg` deploy |                               Used by end users                                |
|   demo   |   [/app/static/commit.txt](https://demo.simplereport.gov/app/static/commit.txt)   |   [/api/actuator/info](https://demo.simplereport.gov/api/actuator/info)   |  Worflow on success of `stg` deploy   |         Used internally to demo the application to potential end users         |
| training | [/app/static/commit.txt](https://training.simplereport.gov/app/static/commit.txt) | [/api/actuator/info](https://training.simplereport.gov/api/actuator/info) | Dispatched on success of `stg` deploy | Used externally by potential users to get a better uderstanding of the product |
|   stg    |   [/app/static/commit.txt](https://stg.simplereport.gov/app/static/commit.txt)    |   [/api/actuator/info](https://stg.simplereport.gov/api/actuator/info)    |            Push to `main`             |  To validate the application work in the cloud and works with prod like data   |
|   dev    |   [/app/static/commit.txt](https://dev.simplereport.gov/app/static/commit.txt)    |   [/api/actuator/info](https://dev.simplereport.gov/api/actuator/info)    |     [Action](#deploy-with-action)     |                     To validate PRs before merging to main                     |
|   test   |   [/app/static/commit.txt](https://test.simplereport.gov/app/static/commit.txt)   |   [/api/actuator/info](https://test.simplereport.gov/api/actuator/info)   |     [Action](#deploy-with-action)     |                     To validate PRs before merging to main                     |
| pentest  | [/app/static/commit.txt](https://pentest.simplereport.gov/app/static/commit.txt)  | [/api/actuator/info](https://pentest.simplereport.gov/api/actuator/info)  |     [Action](#deploy-with-action)     |                     To validate PRs before merging to main                     |

## Deploy

SimpleReport uses a continuous deployment deployment (CD) process
![deployment-1](https://user-images.githubusercontent.com/53869143/130135128-e4cf1b7a-2903-4f20-bd3f-a98daea15fd1.png)

### Revert to a Previous Release

**Note:** A bad version can be rolled backed independent of the FE via the [rollback API actions](https://github.com/CDCgov/prime-simplereport/actions/workflows/rollbackProdAPI.yml)

1. checkout `main`
2. create a new branch (example: `tim-best/revert-feature-A`)
3. Revert to the desired commit `git revert --no-commit 9999999..HEAD && git commit` where 9999999 is the commit you want to revert to
   - This will revert everything from the HEAD back to the commit hash, meaning it will recreate that commit state in the working tree as if every commit after 9999999 had been walked back
4. Create a PR with your branch, wait for tests to pass, get approval and merge
5. Follow instructions in [deploy-with-release](#deploy-with-release)

### Deploy With Action

Navigate to the [Github Actions Tab](https://github.com/CDCgov/prime-simplereport/actions)
![Screen Shot 2021-02-24 at 11 07 13 AM](https://user-images.githubusercontent.com/53869143/109029807-36673100-7691-11eb-81d1-a474517c1eb6.png)

1. Select the environment you want to deploy to from the workflows list on the left. In this case we are selecting the `test` environment
2. Click the "Run workflow" button
3. Select the branch you want to deploy. In this case we are deploying the latest commit on `main`
4. Click the green "Run workflow" button.
5. After the workflow is completed you can verify the changes are live by Checking the deployed commit hash. This is done my going to `/app/static/commit.txt` and `/api/actuator/info`

## Deployment Issues

### Maintenance Mode

Users can be notified of deployment issues by placing SimpleReport in maintenance mode. When maintenance mode is enabled, a banner will appear at the top of each page stating that SimpleReport is currently experiencing an outage, along with a configurable supplemental message (e.g. a reason why).

To do so manually:

1. Create a `MAINTENANCE MESSAGE` in JSON format with an `active` and a `message` key. Example: `{"active": true, "message": "SimpleReport is currently undergoing maintenance"}`. Note that the `active` value must be a _boolean_, not a string.
2. `cd frontend && MAINTENANCE_MESSAGE=(JSON message here) MAINTENANCE_ENV=(desired env) yarn run maintenance:start`

Example:

```Shell
MAINTENANCE_MESSAGE='{"active": true, "message": "SimpleReport is currently experiencing service degradation"}' MAINTENANCE_ENV=dev yarn run maintenance:start
```

Possible values for `MAINTENANCE_ENV`: `dev`, `test`, `pentest`, `training`, `demo`, `stg`, `prod`

An easier way is to run the `Maintenance Mode` Action, which will automatically enable/disable maintenance mode for all environments with your desired message.
