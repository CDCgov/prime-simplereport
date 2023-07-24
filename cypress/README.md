## E2E tests

#### E2E/Integration tests are available using [Cypress](https://www.cypress.io/).

### Requirements:

#### This file is required in the root of the prime-simplereport repo to run integration tests. Please reach out to an engineering team member if you're missing credentials.
- `.env`

#### If you're using the docker-compose e2e setup, you'll need to fill out all of these variables in the `.env` file.

```
# .env

# Docker settings
DOCKER_CLIENT_TIMEOUT=180
COMPOSE_HTTP_TIMEOUT=180

# Backend settings
SPRING_PROFILES_ACTIVE=e2e,db-dockerized
WIREMOCK_URL=http://wiremock:8088
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

CYPRESS_BACKEND_URL=

# Frontend settings
REACT_APP_BACKEND_URL=https://localhost.simplereport.gov/api
PUBLIC_URL=/app/
REACT_APP_OKTA_ENABLED=true
REACT_APP_DISABLE_MAINTENANCE_BANNER=true
REACT_APP_OKTA_URL=http://wiremock:8088
REACT_APP_BASE_URL=https://localhost.simplereport.gov
REACT_APP_OKTA_CLIENT_ID=

# Shared settings (Backend, Frontend)
GIT_DISCOVERY_ACROSS_FILESYSTEM=1
```

#### If you're running e2e tests against a set of local apps with Okta enabled, you only need the following.


```
# .env

OKTA_API_KEY="Get this from your user account in Okta"
SMARTY_AUTH_ID=
SMARTY_AUTH_TOKEN=

CYPRESS_OKTA_USERNAME=
CYPRESS_OKTA_PASSWORD=
CYPRESS_OKTA_SECRET=

CYPRESS_BACKEND_URL=
```

#### If you're running e2e tests against a set of local apps without Okta enabled, you only need the following.

```
# .env

SMARTY_AUTH_ID=
SMARTY_AUTH_TOKEN=

CYPRESS_BACKEND_URL=
```

The `.env` file has a template at `.env.cypress.sample` for running cypress against your local setup or `.env.cypress.remote.sample` to run against a remote environment.

### Running Cypress

#### Make sure you have filled in your `.env` file!

#### Running Cypress with Docker! We don't support running Cypress interactively in docker containers.

1. Install docker and docker-compose.
1. Stop any local instances of your apps to prevent port conflicts.
1. Run Cypress.
  - `yarn e2e`

#### Running Cypress against your local apps!

1. Start your local apps however you normally do!
1. Move to the `cypress/` directory.
1. Run `yarn install` in the cypress directory.
1. Run the yarn command that matches your setup.
- Run Cypress locally and open interactive mode. Do this if you're running the apps locally on bare metal with Okta disabled.
  - `yarn e2e:local`
- Run Cypress locally and open interactive mode. Do this if you're running the apps locally on bare metal with Okta enabled.
  - `yarn e2e:local:okta`
- Run Cypress locally and open interactive mode. Do this if you're running the apps locally with docker-compose with Okta disabled.
  - `yarn e2e:nginx`
- Run Cypress locally and open interactive mode. Do this if you're running the apps locally with docker-compose with Okta enabled.
  - `yarn e2e:nginx:okta`

### Potential issues:

#### My port is already allocated!
  - Check that you have brought down all instances of your apps; you may need to kill a hanging process, and try again.

#### I'm missing certs!
  - Try installing [`mkcert`](https://github.com/FiloSottile/mkcert#installation) and run `yarn start`. This will create the certs you need.

#### I'm using the using the localhost.simplereport.gov domain but I can't see it in the browser!
  - If you want to visit the app in your browser while Cypress runs in docker, you'll need to edit your local /etc/hosts and add the following line.
    - `127.0.0.1 localhost.simplereport.gov`

#### Connection refused errors!
  - Connection refused errors coming out of Nginx logs are normal until your apps have started successfully. When they start, Cypress will begin running tests. If they fail to start, Cypress will time out and bring down all the containers.

#### Invalid template errors from docker!
  - Check that you have escaped special characters in your `.env` file.

#### Cypress user is unable to see certain pages!
  - Check that you have added the correct user roles to your `application-local.yaml` as documented [here](https://github.com/CDCgov/prime-simplereport/wiki/User-roles#updating-user-roles)

#### See the [Cypress documentation](https://docs.cypress.io/api/table-of-contents) for writing new tests. If you need to generate new Wiremock mappings for external services, see [this wiki page](https://github.com/CDCgov/prime-simplereport/wiki/WireMock).
