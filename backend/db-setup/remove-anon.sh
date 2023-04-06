#!/bin/sh

set -e

if [ "$1" = "-l" ]; then
    echo "-- Removing anon from your local database..."
    export PGPASSFILE=backend/db-setup/.pgpass
    chmod 0600 $PGPASSFILE
    psql -v ON_ERROR_STOP=1 -h "${SR_DB_HOST:-localhost}" -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "SELECT anon.remove_masks_for_all_columns();"
    psql -v ON_ERROR_STOP=1 -h "${SR_DB_HOST:-localhost}" -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "SELECT anon.remove_masks_for_all_roles();"
    psql -v ON_ERROR_STOP=1 -h "${SR_DB_HOST:-localhost}" -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "DROP EXTENSION anon CASCADE;"
    psql -v ON_ERROR_STOP=1 -h "${SR_DB_HOST:-localhost}" -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "ALTER DATABASE simple_report RESET session_preload_libraries;"
else
    echo "-- Removing anon from your docker database..."
    docker compose exec db psql -v ON_ERROR_STOP=1 -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "SELECT anon.remove_masks_for_all_columns();"
    docker compose exec db psql -v ON_ERROR_STOP=1 -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "SELECT anon.remove_masks_for_all_roles();"
    docker compose exec db psql -v ON_ERROR_STOP=1 -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "DROP EXTENSION anon CASCADE;"
    docker compose exec db psql -v ON_ERROR_STOP=1 -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "ALTER DATABASE simple_report RESET session_preload_libraries;"
fi

echo "-- Have a great day!"

