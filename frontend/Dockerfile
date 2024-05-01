FROM node:20-alpine as build
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

# Add bash and git
RUN apk add --no-cache git

ARG REACT_APP_BASE_URL
ARG REACT_APP_BACKEND_URL
ARG PUBLIC_URL
ARG REACT_APP_OKTA_URL
ARG REACT_APP_OKTA_ENABLED
ARG REACT_APP_DISABLE_MAINTENANCE_BANNER
ARG GIT_DISCOVERY_ACROSS_FILESYSTEM
ARG REACT_APP_OKTA_CLIENT_ID


ENV REACT_APP_BASE_URL $REACT_APP_BASE_URL
ENV REACT_APP_BACKEND_URL $REACT_APP_BACKEND_URL
ENV PUBLIC_URL $PUBLIC_URL
ENV REACT_APP_OKTA_URL $REACT_APP_OKTA_URL
ENV REACT_APP_OKTA_ENABLED $REACT_APP_OKTA_ENABLED
ENV REACT_APP_DISABLE_MAINTENANCE_BANNER $REACT_APP_DISABLE_MAINTENANCE_BANNER
ENV GIT_DISCOVERY_ACROSS_FILESYSTEM $GIT_DISCOVERY_ACROSS_FILESYSTEM
ENV REACT_APP_OKTA_CLIENT_ID $REACT_APP_OKTA_CLIENT_ID


# Create directory for app, grant ownership to node user
RUN mkdir -p /app/frontend/node_modules

WORKDIR /app/frontend

# Copy over yarn dependency files before src
# so it caches via docker for subsequent builds
COPY ./frontend/package.json /app/frontend/
COPY ./frontend/yarn.lock /app/frontend/

# Install dependencies
RUN yarn install --non-interactive

# copy over the backend graphql schema files
ADD ./backend/ /app/backend
ADD ./frontend /app/frontend
ADD .git /app/.git

#e2e specific, disable content security
RUN echo "REACT_APP_CONTENT_SECURITY_POLICY_DEFAULT_SRC=''" >> .env.production.local
RUN echo "REACT_APP_CONTENT_SECURITY_POLICY_SCRIPT_SRC=''" >> .env.production.local

RUN yarn run build

# production environment
FROM node:20-alpine
RUN npm install -g serve
WORKDIR /app/frontend
COPY --from=build /app/frontend/build /app/frontend/build

# Run app as non-privileged user
USER node

EXPOSE 3000
CMD ["serve", "-s", "build"]
