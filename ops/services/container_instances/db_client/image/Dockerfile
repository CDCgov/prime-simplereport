FROM alpine:3.20
RUN apk --no-cache add postgresql14-client
RUN apk add --no-cache bash
RUN unset HISTFILE
RUN bash -ic 'unset HISTFILE'
RUN bash -ic 'set +o history'
RUN echo 'unset HISTFILE' >> /etc/profile.d/disable.history.sh
RUN echo $(psql --version) >> /tmp/psql_version
ENV PSQL_HISTORY=/export/.psql_history
ENTRYPOINT ["tail", "-f", "/dev/null"]