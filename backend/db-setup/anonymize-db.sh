#!/bin/sh

set -e

echo "Cleaning up the directory for pg dump"
sudo mkdir -p backend/db-setup/snapshots/;
sudo touch backend/db-setup/snapshots/anonymize-db.tmp;
sudo rm backend/db-setup/snapshots/*;

echo "Create a snapshot from our running db"
docker compose exec db /usr/local/lib/snapshot-db.sh && sleep 1;

echo "Anonymize the snapshot"
# TODO use our own db image for this anonymization
cat backend/db-setup/snapshots/* backend/db-setup/anonymize-db.sql | docker run --rm -i registry.gitlab.com/dalibo/postgresql_anonymizer /anon.sh > backend/db-setup/anon_dump.sql;s

echo "Anonymization complete. The anonymized dump is in backend/db-setup/anon_dump.sql"
