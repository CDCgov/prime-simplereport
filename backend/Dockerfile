FROM eclipse-temurin:17-jdk-alpine as build
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

WORKDIR /app/

ADD ./backend /app/backend
ADD ./.git /app/.git

# compile backend into a jar
RUN cd backend && ./gradlew clean build -x test -x checkstyleMain -x spotlessCheck


FROM eclipse-temurin:17-jre-alpine
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

RUN adduser -D appUser

COPY --from=build /app/backend/build/libs/*.jar app.jar

USER appUser

ENTRYPOINT ["java","-jar","/app.jar"]

EXPOSE 8080