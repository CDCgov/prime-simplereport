FROM node:18-alpine
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

# Add bash and git
RUN apk add --no-cache bash git

# Create directory for app, grant ownership to node user
RUN mkdir -p /app/frontend/node_modules
RUN chown -R node:node /app
WORKDIR /app/frontend

# Run app as non-privileged user
USER node

# Install dependencies
COPY package.json yarn.lock /app/frontend/
RUN yarn install --non-interactive

CMD ["yarn", "start"]

EXPOSE 3000