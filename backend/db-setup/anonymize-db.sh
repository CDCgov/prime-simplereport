#!/bin/sh

set -e

SNAPSHOT_SCRIPT=snapshot-db.sh
DB_SETUP_DIR=backend/db-setup

ANON_DUMP_FILE=$DB_SETUP_DIR/anon_dump.sql
SNAPSHOTS_DIR=$DB_SETUP_DIR/snapshots

echo "-- Cleaning up the directory for pg dump."
echo "-- Requires sudo."
sudo mkdir -p $SNAPSHOTS_DIR/;
sudo rm $SNAPSHOTS_DIR/* || true;
sudo rm $ANON_DUMP_FILE || true;

echo "-- Creating a snapshot from our database."
if [ "$1" = "-l" ]; then
    ./$DB_SETUP_DIR/$SNAPSHOT_SCRIPT
else
    docker compose exec db /usr/local/lib/$SNAPSHOT_SCRIPT && sleep 1;
fi

echo "-- Anonymizing the snapshot..."
# TODO use our own db image for this anonymization
cat $SNAPSHOTS_DIR/* $DB_SETUP_DIR/anonymize-db.sql | docker run --rm -v "$PWD/backend/db-setup/generate_db_data.py:/usr/local/lib/generate_db_data.py" -i registry.gitlab.com/dalibo/postgresql_anonymizer /anon.sh > $ANON_DUMP_FILE;

echo "-- Anonymization complete! The anonymized dump is in $ANON_DUMP_FILE"

echo "-- Have a great day!"
