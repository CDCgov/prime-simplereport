#!/bin/sh

set -e

echo "remove current snapshots"
sudo rm backend/db-setup/snapshots/*

echo "create a snapshot from our running db"
docker compose exec db /usr/local/lib/snapshot-db.sh && sleep 1

echo "anonymize the snapshot"
# TODO use our own db image for this anonymization
cat backend/db-setup/snapshots/* backend/db-setup/anonymize-db.sql | docker run --rm -i registry.gitlab.com/dalibo/postgresql_anonymizer /anon.sh > backend/db-setup/anon_dump.sql
