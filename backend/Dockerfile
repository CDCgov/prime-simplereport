FROM gradle:6.6.1-jdk8-hotspot

COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle build --no-daemon 

# db will be running in another container, for purposes of this local file
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/simple_report

ENTRYPOINT ["gradle", "--info", "--no-daemon"]
CMD ["tasks"]
