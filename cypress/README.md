## E2E tests

E2E/Integration tests are available using [Cypress](https://www.cypress.io/).

#### Requirements:

These files required to run integration tests. Please reach out to the engineering team if you're in need of the missing credentials.
- `.env`

If you're running against your local apps you can set up you `.env` file in the projects root directory like this one.

If you run outside the docker containers, you only need the variables that start with `CYPRESS_`.

```

# .env

# Docker settings
DOCKER_CLIENT_TIMEOUT=180
COMPOSE_HTTP_TIMEOUT=180

# Backend settings
SPRING_PROFILES_ACTIVE=e2e,db-dockerized
WIREMOCK_URL=http://cypress:8088
SPRING_LIQUIBASE_ENABLED="true"
OKTA_TESTING_DISABLEHTTPSCHECK="true"

OKTA_API_KEY="Get this from your user account in Okta"
OKTA_OAUTH2_CLIENT_ID=
SMARTY_AUTH_ID=
SMARTY_AUTH_TOKEN=

# Cypress settings
SPEC_PATH="cypress/integration/*"

CYPRESS_OKTA_USERNAME=
CYPRESS_OKTA_PASSWORD=
CYPRESS_OKTA_SECRET=

# Frontend settings
REACT_APP_BACKEND_URL=https://localhost.simplereport.gov/api
PUBLIC_URL=/app/
REACT_APP_OKTA_ENABLED=true
REACT_APP_DISABLE_MAINTENANCE_BANNER=true
REACT_APP_OKTA_URL=http://cypress:8088
REACT_APP_BASE_URL=https://localhost.simplereport.gov
REACT_APP_OKTA_CLIENT_ID=

# Shared settings (Backend, Frontend)
GIT_DISCOVERY_ACROSS_FILESYSTEM=1
```

The `.env` file has a template at `.env.cypress.sample` for running cypress against your local setup or `.env.cypress.remote.sample` against a remote environment. Please reach out to the engineering team if you're in need of the missing credentials.

#### Running Cypress
Now that you have those files set up, you are ready for a test run! There are a few ways to run the tests from the root directory:

Running Cypress locally in the cypress directory. You need to start the SR apps yourself.
1. Run yarn install in cypress directory.
1. Start your apps
1. Run the yarn command that matches your setup.
- Run Cypress locally and open interactive mode. Do this if you're running the apps locally on bare metal with okta disabled.
  - `yarn e2e:local`
- Run Cypress locally and open interactive mode. Do this if you're running the apps locally on bare metal with okta enabled.
  - `yarn e2e:local:okta`
- Run Cypress locally and open interactive mode. Do this if you're running the apps locally with docker-compose with okta disabled.
  - `yarn e2e:nginx`
- Run Cypress locally and open interactive mode. Do this if you're running the apps locally with docker-compose with okta enabled.
  - `yarn e2e:nginx:okta`

We don't support running cypress interactively in docker containers.

Running Cypress with docker in the root directory. You need to make sure to stop all other instances of the SR apps.
1. Install docker and docker compose.
1. Run Cypress.
  - `yarn e2e`


Potential issues:
Missing certs? 
  - Try installing `mkcert`
Using the localhost.simplereport.gov domain? 
  - If you want to visit the app in your browser while Cypress runs, you can edit your local /etc/hosts and add the following line.
    - `127.0.0.1 localhost.simplereport.gov`
Connection refused errors?
  - Connection refused errors coming out of nginx are normal until your app have started successfully. When they start Cypress will start running tests. If they fail to start, Cypress will time out and bring down all the containers.
Invalid template errors from docker?
  - Double check that you have escaped any characters that need escaped in your `.env` file.

See the [Cypress documentation](https://docs.cypress.io/api/table-of-contents) for writing new tests. If you need to generate new Wiremock mappings for external services, see [this wiki page](https://github.com/CDCgov/prime-simplereport/wiki/WireMock).
