FROM gradle:7.6.0-jdk11
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

WORKDIR /app/backend

# Only copy dependency-related files
COPY build.gradle gradle.properties settings.gradle /app/backend/
RUN chown -R gradle:gradle /app
USER gradle

# Only download dependencies
# Eat the expected build failure since no source code has been copied yet
RUN gradle clean build --no-daemon > /dev/null 2>&1 || true

CMD ["./run.sh"]

EXPOSE 8080