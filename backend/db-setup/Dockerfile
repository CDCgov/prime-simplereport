FROM postgres:18.0-alpine3.22

RUN apk add py3-pip postgresql-libs gcc musl-dev postgresql-dev make
COPY ./requirements.txt /usr/local/lib/requirements.txt
COPY ./generate_db_data.py /usr/local/lib/generate_db_data.py
RUN pip3 install -r /usr/local/lib/requirements.txt --break-system-packages
WORKDIR /usr/local/lib/
