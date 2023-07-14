FROM nginx:1.25-alpine as build
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

RUN curl -JLO "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64"
RUN chmod +x mkcert-v1.4.4-linux-amd64
RUN cp mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert

WORKDIR certs
RUN mkcert -install
RUN mkcert localhost.simplereport.gov
RUN mv localhost.simplereport.gov.pem localhost.simplereport.gov.crt
RUN mv localhost.simplereport.gov-key.pem localhost.simplereport.gov.key


FROM nginx:1.25-alpine
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

COPY  ./default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /certs /etc/nginx/certs
