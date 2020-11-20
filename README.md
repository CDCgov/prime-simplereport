This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# RUNNING THE APP LOCALLY

## Prereqs

#### 1. Install Docker and docker-compose

- You can install docker hub directly: https://hub.docker.com/. This is preferred
- alternatively, you can install docker and run it as a daemon: `brew install docker`.

#### 2. Front-end pre-Requisites

- version of node
- (optional) probably want to install react and redux developer tools extensions

## Backend

There are two major pieces:

- Java Spring
- Postgres

To run the service, you needs a DB and a connection to Okta for it to work. Locally, you can disable authentication, but you still need the database running locally.

Starting from a fresh:

1. go to `backend` and use `docker-compose up --build`
2. locally, update your environment variable: `export SPRING_PROFILES_ACTIVE=dev`. This disables authentication
3. to verify, go to `localhost:8080` to see interact with the graphql api. You would need to point the api endpoint to the backend at: `http://localhost:8080/graphql` This gives you a preview to query/mutate the local database.

Sometimes if the binding changes, you would need to tear down the containers, volumes, images and rebuild. You can run the following commands for this:

```
docker-compose down
docker system prune
docker images prune
docker volumes prune
docker-compose up --build
```

## Frontend

1. go to `frontend` and run `npm install`
2. `npm run start` and go to `localhost:3000`.

- note: at least right now, you would need the backend and database running

## Deploy (OUT OF DATE)

## To deploy to the stable (ish) demo environment:

1. Point your browser to the [Deploy Client Application](https://github.com/CDCgov/prime-data-input-client/actions?query=workflow%3A%22Deploy+Client+Application%22) action
2. Click the "Run workflow" button, and select `main` as the branch
3. Get up and stretch

## To deploy to the dev/test environment:

Either

1. merge your feature branch into the `staging` branch
2. push that branch

Or

1. Point your browser to the [Deploy Client Application](https://github.com/CDCgov/prime-data-input-client/actions?query=workflow%3A%22Deploy+Client+Application%22) action
2. Click the "Run workflow" button, and select your feature branch

In either case, get up and stretch and have a glass of water.

## To restage a deployment in cloud.gov

1. Point your browser to the [Restage Application](https://github.com/CDCgov/prime-data-input-client/actions?query=workflow%3A"Restage+Application") action
2. Click the "Run workflow" button, and enter either "client" (for the demo deployment) or
   "staging" (for the dev-test deployment). Yes, that's silly and we will probably change it in the future--if
   we have, update this text!
