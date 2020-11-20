#!/bin/bash
here=$(dirname $BASH_SOURCE)
export PGPASSFILE=${here}/.pgpass
chmod 0600 $PGPASSFILE # git always botches this up
psql -h localhost -p ${SR_DB_PORT:-5432} simple_report -U postgres -f ${here}/reset-db.sql
