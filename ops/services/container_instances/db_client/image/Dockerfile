FROM alpine:3.18
RUN apk --no-cache add postgresql14-client
RUN apk add --no-cache bash
RUN set +o history
RUN echo 'set +o history' >> /etc/profile.d/disable.history.sh
ENTRYPOINT ["tail", "-f", "/dev/null"]