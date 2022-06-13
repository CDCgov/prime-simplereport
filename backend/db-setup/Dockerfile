FROM postgres:13-alpine

RUN apk add py3-pip postgresql-libs gcc musl-dev postgresql-dev make
RUN pip3 install pgxnclient
RUN pgxn install postgresql_anonymizer
COPY ./requirements.txt /opt/db/requirements.txt
COPY ./generate_db_data.py /opt/db/generate_db_data.py
RUN pip3 install -r /opt/db/requirements.txt
WORKDIR /opt/db/
