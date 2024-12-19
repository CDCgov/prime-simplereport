FROM alpine:3.21
RUN apk --no-cache add postgresql15-client
RUN apk add --no-cache bash
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    dockeruser
RUN echo 'dockeruser ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers sudo
RUN unset HISTFILE
RUN bash -ic 'unset HISTFILE'
RUN bash -ic 'set +o history'
RUN echo 'unset HISTFILE' >> /etc/profile.d/disable.history.sh
USER dockeruser
WORKDIR /home/dockeruser
RUN echo $(psql --version) >> /tmp/psql_version
ENV PSQL_HISTORY=/export/.psql_history
ENTRYPOINT ["tail", "-f", "/dev/null"]


