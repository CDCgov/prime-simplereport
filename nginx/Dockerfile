FROM nginx:1.29.5-alpine as build
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

RUN /bin/ash -c 'set -ex && \
    ARCH=`uname -m` && \
    if [ $ARCH = "x86_64" ]; then \
        curl -JLo mkcert-v1.4.4 "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64"; \
    elif [ $ARCH = "aarch64" ]; then \
        curl -JLo mkcert-v1.4.4 "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-arm64"; \
    fi'

RUN chmod +x mkcert-v1.4.4
RUN cp mkcert-v1.4.4 /usr/local/bin/mkcert

WORKDIR certs
RUN mkcert -install
RUN mkcert localhost.simplereport.gov
RUN mv localhost.simplereport.gov.pem localhost.simplereport.gov.crt
RUN mv localhost.simplereport.gov-key.pem localhost.simplereport.gov.key


FROM nginx:1.29.5-alpine
LABEL org.opencontainers.image.source https://github.com/CDCgov/prime-simplereport

COPY  ./default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /certs /etc/nginx/certs
