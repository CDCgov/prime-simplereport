FROM gradle:6.9.1-jdk11-hotspot AS build

USER gradle

WORKDIR /home/gradle/graphql-api
COPY ./.git ./.git

WORKDIR /home/gradle/graphql-api/backend
COPY backend/gradle ./gradle
COPY backend/*.gradle ./
COPY ./backend/config ./config
COPY ./backend/src ./src
COPY ./backend/gradle.properties gradle.properties
COPY ./backend/db_rollback_to_tag.sh ./db_rollback_to_tag.sh

ENTRYPOINT ["./db_rollback_to_tag.sh"]