FROM postgres:14.8-bookworm

RUN apt update
RUN apt install python3-pip postgresql-contrib gcc musl-dev postgresql-common make -y
RUN pip3 install pgxnclient
RUN pgxn install postgresql_anonymizer
COPY ./requirements.txt /usr/local/lib/requirements.txt
COPY ./generate_db_data.py /usr/local/lib/generate_db_data.py
RUN pip3 install -r /usr/local/lib/requirements.txt
WORKDIR /usr/local/lib/
