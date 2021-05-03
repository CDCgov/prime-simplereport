
RESET_DIR=${LIB_DIR:-/usr/local/lib}
createuser -U "$POSTGRES_USER" -w simple_report_migrations
createuser -U "$POSTGRES_USER" -w simple_report_app
createuser -U "$POSTGRES_USER" -w simple_report_no_phi
createdb -U "$POSTGRES_USER" -w simple_report --maintenance-db="$POSTGRES_DB"

psql -v ON_ERROR_STOP=1  -U "$POSTGRES_USER" simple_report -f "$RESET_DIR/reset-db.sql"
