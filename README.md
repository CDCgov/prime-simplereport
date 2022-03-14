![SimpleReport Logo](/.meta/SimpleReportLogo.svg)

https://www.simplereport.gov/

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=CDCgov_prime-data-input-client&metric=alert_status)](https://sonarcloud.io/dashboard?id=CDCgov_prime-data-input-client) [![Sonar coverage](https://shields.io/sonar/coverage/CDCgov_prime-data-input-client?server=https://sonarcloud.io)](https://sonarcloud.io/dashboard?id=CDCgov_prime-data-input-client)

## Table of Contents

  - [Developing locally](#developing-locally)
  - [Running outside of docker](#running-outside-of-docker)
  - [Support admin](#support-admin)
  - [Roles](#roles)
  - [Database cleaning](#database-cleaning)
  - [Rollbacks](#rollbacks)
  - [API testing](#api-testing)
  - [Tests](#tests)
  - [E2E tests](#e2e-tests)
  - [Twilio](#twilio)
  - [MailHog](#mailhog)
  - [Frontend](#frontend)
    - [Linters](#linters)
    - [Storybook and Chromatic](#storybook-and-chromatic)
  - [PR Conventions](#pr-conventions)
  - [Cloud Environments](#cloud-environments)
  - [Deploy](#deploy)
    - [Revert to a Previous Release](#revert-to-a-previous-release)
    - [Deploy With Action](#deploy-with-action)

## Developing locally

The Simple Report application stack consists of:
- PostgreSQL database
- Java Spring Boot backend
- React frontend

For ease of local setup, we have created a docker compose setup which builds docker images for all the necessary components. It also uses nginx and mkcert to host the app locally over HTTPS. 

To use this, you'll need to install the following:

1. Install [docker and docker compose](https://docs.docker.com/get-docker/).
1. Install [mkcert](https://github.com/FiloSottile/mkcert#installation)
1. Install Node.js 14, either using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) or your preferred method. This is used for yarn scripts and pre-commit hooks.
1. Install AdoptOpenJDK 11, either using [jabba](https://github.com/shyiko/jabba) or your preferred method. This is useful for IDE integration (IntelliJ, VS Code, etc.)

Once those dependencies are installed, follow these steps to get the app up and running:

1. Clone this repository: `git clone git@github.com:CDCgov/prime-simplereport.git`
2. Run `yarn install` in the root of the repository to install pre-commit hooks using lefthook
3. Run `cp .env.sample .env` in the root of the repository, then obtain the needed secrets from Azure or another developer. Be sure to set the `OKTA_API_KEY` environment variable. You can generate an API token for yourself by logging into the Okta Preview [admin panel](https://hhs-prime-admin.oktapreview.com) and going into Security > API > Tokens.
4. Run `sudo vim /etc/hosts` (or use your editor of choice) and add a line to the bottom with the following contents and save: `127.0.0.1 localhost.simplereport.gov`
5. Follow these steps from GitHub for [authenticating to the container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-to-the-container-registry).
6. Run `yarn start` in the root of the repository to start the app
7. Make your user a support admin by assigning yourself the `SR-DEV-ADMINS` group in Okta Preview.
8. When the frontend and backend builds are complete, visit https://localhost.simplereport.gov/app

You should see the support admin page. The application does not yet start with any seed data, so you'll need to add your own organization and facilities. You can create your first org at https://localhost.simplereport.gov/app/sign-up.

#### Notes
Make sure docker has access to enough resources on your local machine. You'll know it doesn't if you get an error from any of your containers similar to this:
```
"The build failed because the process exited too early. This probably means the system ran out of memory or someone called `kill -9` on the process."
```

How to update resources limits on your [Mac](https://docs.docker.com/desktop/mac/#resources), and [Windows](https://docs.docker.com/desktop/windows/#resources) machines.

## Running outside of docker

If you wish to run outside of docker compose (bare metal), you'll need to install all the dependencies locally.
See more [info here](https://github.com/CDCgov/prime-simplereport/wiki/Running-outside-of-docker).

## Roles

The available user role types are `ADMIN`, `USER`, `ENTRY_ONLY`, `ALL_FACILITIES`, and `NO_ACCESS`. You can check `backend/src/main/java/gov/cdc/usds/simplereport/config/authorization/OrganizationRole.java` for a list of available roles

- `ADMIN` - an organization admin with full access to their organization
- `USER` - a site user the has access to everything in their organization but the gear icon
- `ENTRY_ONLY` - a site user that only has access to the Conduct Test tab
- `ALL_FACILITIES` - a site user that can access all facilities in their organization
- `NO_ACCESS` - a member of an organization who has no permissions without possessing other roles. Every member of an org has this role, so it is used to list all users in an organization

These roles are controlled via Okta groups.

## Support admin

You can make your user a support admin by assigning yourself the `SR-DEV-ADMINS` group in Okta Preview.

Support admins can access the `/admin` paths and support admin APIs.

## Database cleaning

When there are DB schema changes the backend may throw an error and fail to start.

To create a fresh database:

1. `docker compose down --volumes`

Note that until we create seed data, this will start you with an empty database, and you will need to manually create organizations and facilities again.

## Rollbacks

The application uses the Liquibase plugin for Gradle to perform certain database management tasks.

To roll the database back to its state at a prior date:

```
docker compose run --rm backend gradle liquibaseRollbackToDate -PliquibaseCommandValue=${date}
```

To roll back a certain _number_ of migrations:

```
docker compose run --rm backend gradle liquibaseRollbackCount -PliquibaseCommandValue=${n}
```

To roll back to a certain tag:

```
docker compose run --rm backend gradle liquibaseRollback -PliquibaseCommandValue=${TAG}
```

If you are required to roll back a non-local database, you may generate the required SQL to execute elsewhere. Use `liquibaseRollbackToDateSQL` or `liquibaseRollbackCountSQL` in the manner described above to write the rollback SQL to stdout.

## API testing

You can make requests to the GraphQL API using [Insomnia](https://insomnia.rest/download) or a similar client. You would need to point the api endpoint to the backend at: `https://localhost.simplereport.gov/api/graphql` This gives you a preview to query/mutate the local database.  
  
When using Insomnia, you'll also need to pass your access_token in the `Authorization` header - this can be found in Application -> Local Storage -> Access Token on a Chrome browser, or by typing `localStorage.getItem("access_token")` into the console. Copy that value, then create an `Authorization` header with the value `Bearer ${access_token}`.

## Tests

Run frontend unit tests:

```
yarn test:frontend
```

Run backend unit tests:

```
yarn test:backend
```

## E2E tests

E2E/Integration tests are available using [Cypress](https://www.cypress.io/).

#### Requirements:

These files required to run integration tests.
- `frontend/.env.local`
- `frontend/cypress/.env.e2e`
- `/etc/hosts`

```
# frontend/cypress/.env.e2e
REACT_APP_BASE_URL=http://localhost.simplereport.gov
REACT_APP_BACKEND_URL=http://localhost.simplereport.gov/api
REACT_APP_OKTA_ENABLED=true
REACT_APP_OKTA_URL=http://localhost:8088
```

The `frontend/.env.local` file has a template at `frontend/cypress/.env.e2e.sample`. Reach out to another developer to get proper values for these secrets.

```
# /etc/hosts
# add the following line
127.0.0.1 localhost.simplereport.gov
```

#### Running Cypress
Now that you have those files set up, you are ready for a test run! There are a few ways to run the tests from the `frontend` directory:

- `yarn e2e`
  - This will run cypress with default values and display Cypress logs.
- `yarn e2e:open`
  - This will open an interactive test runner that lets you select browsers
  - Additional requirement: To use this command you need to set the WIREMOCK_URL env var in your command line.
    - Set this for macOS
        - `WIREMOCK_URL=http://host.docker.internal:8088`
    - Set this for Linux operating systems (if you have a non standard networking setup, set it to whatever IP will point to your local machine).
        - `WIREMOCK_URL=http://172.17.0.1:8088`
- `yarn e2e:verbose`
  - This will run cypress with default values and display Cypress, API, DB, Frontend, and Nginx logs.

See the [Cypress documentation](https://docs.cypress.io/api/table-of-contents) for writing new tests. If you need to generate new Wiremock mappings for external services, see [this wiki page](https://github.com/CDCgov/prime-simplereport/wiki/WireMock).


## Load Tests
SimpleReport leverages Locust for running its load tests. Currently, Locust starts as part of the local development build, and spawns three separate worker containers for inundating the system.

To compose Locust with the rest of the development stack, run `yarn locust` instead of `yarn start`. *(NOTE: All other prerequisites listed above in "Developing locally" are still required for tests to function.)*

To access the Locust user interface, navigate to `http://localhost:8089/`. Load tests will not kick off automatically; they must be manually invoked.

Tests can be configured by modifying `backend/locust/locustfile.py`.


## Twilio

Twilio's Java SDK auto-configures based on two environment variables: `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`. SMS is also disabled by default, and can be enabled in application.yml:

```
twilio:
  enabled: true
  from-number: +13214560987
```

These can also be set by environment variable if desired.

## MailHog

MailHog is an email-testing tool with a fake SMTP server underneath, we can use it to test sending emails locally.

- Mailhog client runs on docker, `docker compose up -d mailhog`

- Access mailhog inbox on `http://localhost:8025/`

## Frontend

The front end is a React app. The app uses [Apollo](https://www.apollographql.com/) to manage the graphql API. For styling the app leverages the [U.S. Web Design System (USWDS)](https://designsystem.digital.gov/). Ensure your node version is version 14 in order for
yarn to build packages correctly.

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
MAINTENANCE_MESSAGE='{"active": true, "header" : "SimpleReport is currently experiencing an outage.", "message": "SimpleReport is currently experiencing service degradation"}' MAINTENANCE_ENV=dev yarn run maintenance:start
```

Possible values for `MAINTENANCE_ENV`: `dev`, `test`, `pentest`, `training`, `demo`, `stg`, `prod`

An easier way is to run the `Maintenance Mode` Action, which will automatically enable/disable maintenance mode for all environments with your desired message.
