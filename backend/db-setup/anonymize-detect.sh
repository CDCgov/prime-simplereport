#!/bin/sh

set -e
 
docker compose exec db psql -v ON_ERROR_STOP=1 -p ${SR_DB_PORT:-5432} -U postgres simple_report -c "ALTER DATABASE simple_report SET session_preload_libraries = 'anon';"
docker compose exec db psql -v ON_ERROR_STOP=1 -p ${SR_DB_PORT:-5432} -U postgres simple_report -c "CREATE EXTENSION IF NOT EXISTS anon CASCADE;"
docker compose exec db psql -v ON_ERROR_STOP=1 -p ${SR_DB_PORT:-5432} -U postgres simple_report -c "SELECT anon.init();"
docker compose exec db psql -v ON_ERROR_STOP=1 -p ${SR_DB_PORT:-5432} -U postgres simple_report -c "SELECT anon.detect('en_US');"
