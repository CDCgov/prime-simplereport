FROM gradle:6.6.1-jdk8-hotspot

WORKDIR /home/gradle/graphql-api
COPY --chown=gradle:gradle gradle ./gradle
COPY --chown=gradle:gradle ./*.gradle ./

# nice optimization opportunity: get the dependencies cached in an intermediate
# docker layer (have to tickle gradle, may not be worth it)

# This is only useful if we have the git-info actuator, in which case we have 
# to rearrange some files because we're in a subdirectory
# COPY --chown=gradle:gradle ./.git ./.git
COPY --chown=gradle:gradle ./config ./config
COPY --chown=gradle:gradle ./src ./src

RUN gradle --no-daemon classes testClasses assemble

# db will be running in another container, for purposes of this local file
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/simple_report

ENTRYPOINT ["gradle", "--info", "--no-daemon"]
CMD ["tasks"]
