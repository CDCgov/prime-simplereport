FROM eclipse-temurin:17-jdk-alpine
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

RUN adduser -D appUser

WORKDIR app
COPY . .
RUN wget https://repo1.maven.org/maven2/com/github/tomakehurst/wiremock-jre8-standalone/2.29.1/wiremock-jre8-standalone-2.29.1.jar

USER appUser

ENTRYPOINT ["java", "-jar", "./wiremock-jre8-standalone-2.29.1.jar", "--local-response-templating", "--port", "8088", "--root-dir", "./stubs"]

EXPOSE 8088