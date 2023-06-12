FROM nginx:1.25-alpine as build
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

WORKDIR certs

RUN apk add mkcert --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing/
RUN mkcert -install
RUN mkcert localhost.simplereport.gov
RUN mv localhost.simplereport.gov.pem localhost.simplereport.gov.crt
RUN mv localhost.simplereport.gov-key.pem localhost.simplereport.gov.key


FROM nginx:1.25-alpine
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

COPY  ./default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /certs /etc/nginx/certs
