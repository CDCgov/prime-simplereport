#!/bin/bash
here=$(dirname $BASH_SOURCE)
export PGPASSFILE=${here}/.pgpass
chmod 0600 $PGPASSFILE # git always botches this up

user=${SR_DB_USER:-postgres}
last_snapshot=$(ls -1t ${here}/snapshots/*.sql 2> /dev/null | head -1)
input_file=${SNAPSHOT:-${last_snapshot}}

if [ -z "$input_file" ]; then
   echo "No snapshot found to restore"
   exit 1
fi

echo Restoring from $input_file

psql -h ${SR_DB_HOST:-localhost} -p ${SR_DB_PORT:-5432} -U ${SR_DB_USER:-postgres} simple_report -f $input_file