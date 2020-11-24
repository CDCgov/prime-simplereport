This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# RUNNING THE APP LOCALLY

## Prereqs

#### 1. Install Docker and docker-compose

- You can install docker hub directly: https://hub.docker.com/. This is the preferred solution and should come with docker-compose
- alternatively, you can install docker and run it as a daemon: `brew install docker`.

#### 2. Front-end prerequisites

- [nvm](https://github.com/nvm-sh/nvm) 
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

1. go to `frontend`
1. run `nvm use`
1. run `npm install`
2. run `npm run start` and go to `localhost:3000`.

- note: at least right now, you would need the backend and database running

## Deploy

TODO
