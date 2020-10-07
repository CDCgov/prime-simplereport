This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# About

## Client

To quickly level set about how this app works:

### Frontend

The frontend

- is a React app built and uses functional components
- it is designed for tablets and uses [USWDS](https://designsystem.digital.gov/)
- it uses vanilla javascript
- component state and lifecycles are managed by React hooks
- global state is managed by Redux and uses selectors. Most things are in global state
- directory strucuture follows the "duck" pattern (most everything for a feature/domain is under one directory)
  - domains include: User, Patient, Organization, TestResult, Device
- conventions mostly follow [https://redux.js.org/style-guide/style-guide](redux conventions)
- container component paradigm is used often (one component handles data, another deals solely with presentation logic)
- custom mapping functions exist to transform data from the backend to the frontend, and vice versa

Things to be aware of:

- there are no tests for the frontend
- browser support is limited
-

# RUNNING THE APP LOCALLY

## Initial Setup

1. [Install Docker](https://www.docker.com/get-started)
2. Clone the repo
3. In the root directory, run `npm install`

## Option 0: Run app via npm scripts

For the time being, this is the best option for local development because changes would be watched for immediately.

In the root directory, run:

> npm run start

## Option 1: Docker Componse

1. Go to the root directory (whatever directory has the `docker-compose.yml` file)

> docker-compose up -d --build

2. Go to `localhost:3000`. The app is running in watch mode.

3. To stop the app:

> docker-compose stop

Note: `docker-compose` may be overkill right now since there is only one service, but we might add a lightweight node backend later.

## Option 2: Docker Build

You can create an image from the dockerfile directly

1. build the image

> docker build -t data-input-mvp:dev .

2. spin up a container from the image

```
docker run \
    -it \
    --rm \
    -v ${PWD}:/app \
    -v /app/node_modules \
    -p 3000:3000 \
    -e CHOKIDAR_USEPOLLING=true \
    data-input-mvp:dev
```

3. go to localhost:3000

## TODOS

- establish a workflow where you can add depedencies (via `npm install <dependency>`) without having to manually stop the container, rebuild, and restart.
- distinguish between

## DEPLOY

> cd frontend
> npm run build (not actually sure if this is necessary)
> cf login -a api.fr.cloud.gov --sso
> cf push prime-intput-frontend

# EVERYTHING BELOW THIS IS BOILER-PLACE CREATE-REACT APP

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
