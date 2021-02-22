#!/bin/bash
here=$(dirname $BASH_SOURCE)
export PGPASSFILE=${here}/.pgpass
chmod 0600 $PGPASSFILE # git always botches this up
mkdir -p ${here}/snapshots
pg_dump -h ${SR_DB_HOST:-localhost} -p ${SR_DB_PORT:-5432} simple_report -U postgres -f ${here}/snapshots/${SR_DB_HOST:-localhost}-$(date +%Y-%m-%dT%H%M%S).sql
