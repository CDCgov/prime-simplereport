FROM alpine:3.18
RUN apk --no-cache add postgresql14-client
RUN apk add --no-cache bash
RUN unset HISTFILE
RUN bash -ic 'unset HISTFILE'
RUN bash -ic 'set +o history'
RUN echo 'unset HISTFILE' >> /etc/profile.d/disable.history.sh
RUN touch /tmp/healthy
ENV PSQL_HISTORY=/export/.psql_history
ENTRYPOINT ["tail", "-f", "/dev/null"]