FROM node:14-alpine

RUN apk add --no-cache git

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /frontend

CMD ["yarn", "start"]

EXPOSE 3000
