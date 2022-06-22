#!/bin/sh

set -e

if [ "$1" = "-l" ]; then
    echo "-- Running DB on your local database..."
    export PGPASSFILE=backend/db-setup/.pgpass
    chmod 0600 $PGPASSFILE
    psql -v ON_ERROR_STOP=1 -h "${SR_DB_HOST:-localhost}" -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "ALTER DATABASE simple_report SET session_preload_libraries = 'anon';"
    psql -v ON_ERROR_STOP=1 -h "${SR_DB_HOST:-localhost}" -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "CREATE EXTENSION IF NOT EXISTS anon CASCADE;"
    psql -v ON_ERROR_STOP=1 -h "${SR_DB_HOST:-localhost}" -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "SELECT anon.init();"
    psql -v ON_ERROR_STOP=1 -h "${SR_DB_HOST:-localhost}" -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "SELECT anon.detect('en_US');"
    psql -v ON_ERROR_STOP=1 -h "${SR_DB_HOST:-localhost}" -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "ALTER DATABASE simple_report RESET session_preload_libraries;"
else
    echo "-- Running DB on your docker database..."
    docker compose exec db psql -v ON_ERROR_STOP=1 -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "ALTER DATABASE simple_report SET session_preload_libraries = 'anon';"
    docker compose exec db psql -v ON_ERROR_STOP=1 -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "CREATE EXTENSION IF NOT EXISTS anon CASCADE;"
    docker compose exec db psql -v ON_ERROR_STOP=1 -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "SELECT anon.init();"
    docker compose exec db psql -v ON_ERROR_STOP=1 -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "SELECT anon.detect('en_US');"
    docker compose exec db psql -v ON_ERROR_STOP=1 -p "${SR_DB_PORT:-5432}" -U postgres simple_report -c "ALTER DATABASE simple_report RESET session_preload_libraries;"
fi

echo "-- Have a great day!"

