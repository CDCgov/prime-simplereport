FROM gradle:6.7.1-jdk11-hotspot
ENV DOCKER_BUILDKIT 0

WORKDIR /home/gradle/graphql-api
COPY --chown=gradle:gradle ./.git ./.git

WORKDIR /home/gradle/graphql-api/backend
COPY --chown=gradle:gradle ./backend/gradle ./gradle
COPY --chown=gradle:gradle ./backend/*.gradle ./
COPY --chown=gradle:gradle ./backend/config ./config
COPY --chown=gradle:gradle ./backend/gradle.properties gradle.properties

RUN gradle --no-daemon classes testClasses assemble

# db will be running in another container, for purposes of this local file
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/simple_report

ENTRYPOINT ["gradle", "--info", "--no-daemon"]
CMD ["tasks"]
