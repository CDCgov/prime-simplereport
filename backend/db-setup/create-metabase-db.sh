
RESET_DIR=${LIB_DIR:-/usr/local/lib}

psql -v ON_ERROR_STOP=1  -U "$POSTGRES_USER" metabase -f "$RESET_DIR/reset-metabase-db.sql"
