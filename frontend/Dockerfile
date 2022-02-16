FROM node:14-alpine

# Add bash and git
RUN apk add --no-cache bash git

# Create directory for app, grant ownership to node user
RUN mkdir -p /app/frontend/node_modules
RUN chown -R node:node /app
WORKDIR /app/frontend

# Run app as non-privileged user
USER node
CMD ["yarn", "start"]

EXPOSE 3000