FROM postgres:14-alpine3.16

RUN apk add py3-pip postgresql-libs gcc musl-dev postgresql-dev make
RUN pip3 install pgxnclient
RUN pgxn install postgresql_anonymizer
COPY ./requirements.txt /usr/local/lib/requirements.txt
COPY ./generate_db_data.py /usr/local/lib/generate_db_data.py
RUN pip3 install -r /usr/local/lib/requirements.txt
WORKDIR /usr/local/lib/
