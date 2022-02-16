FROM gradle:6.9.2-jdk11

WORKDIR /app/backend

# Only copy dependency-related files
COPY build.gradle gradle.properties settings.gradle /app/backend/
RUN chown -R gradle:gradle /app
USER gradle

# Only download dependencies
# Eat the expected build failure since no source code has been copied yet
RUN gradle clean build --no-daemon > /dev/null 2>&1 || true

# db will be running in another container, for purposes of this local file
ARG SR_DB_PORT
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://db:$SR_DB_PORT/simple_report

CMD ["./run.sh"]

EXPOSE 8080