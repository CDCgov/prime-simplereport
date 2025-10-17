FROM eclipse-temurin:24.0.2_12-jdk as build
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

WORKDIR /app/

ADD ./backend /app/backend
ADD .git /app/.git

# compile backend into a jar
RUN cd backend && ./gradlew clean build -x test -x checkstyleMain -x spotlessCheck

FROM eclipse-temurin:24.0.2_12-jre
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

COPY --from=build /app/backend/build/libs/*.jar app.jar

ENTRYPOINT ["java","-jar","/app.jar"]

EXPOSE 8080