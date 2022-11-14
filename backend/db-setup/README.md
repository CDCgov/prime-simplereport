# Development Database Setup/Management Tools

This directory contains a set of shell scripts intended to let you easily
handle common development situations related to the database.

## Configuration and management

All of the scripts in this directory respect two environment variables:

- `SR_DB_PORT` is the port on which the database is listening (default: 5432)
- `SR_DB_HOST` is the host on which the database is running (default: localhost)

This allows these scripts to be used for maintaining both the development and
test databases (which generally run locally on different ports). It also allows
them to be used against remote databases in deployed environments: please use
care when attempting such maneuvers, as there is no warranty attached to this
code.

All of the scripts in this directory otherwise assume that you are using the
default setup (i.e. database, user, and schema names) configured for dockerized
databases in this directory, in the `dev` bean profile and the test application
configuration.

## Clear your database and start over

In the event that you want to delete everything releated to SimpleReport,
you can run `db-setup/nuke-db.sh` and it will do that. This deletes the schema
that we use for our data, and is not reversible other than by restoring from a
backup.

To do this on your test database, just run `./gradlew testDbReset` and gradle
will run this command using what it thinks your test DB port is (gradle is
likely to be right, since it controls what your test DB port is).

## Snapshot your database

If you are about to do something that might create a broken database state that
is hard to roll back from, you can save the state of your database using
`db-setup/snapshot-db.sh`.  This will create a timestamped SQL snapshot in `db-setup/snapshots`.

## Restore your database from a snapshot

If you have taken a snapshot (either with the script above or by direct use of
`pg_dump`) and you want to restore from it, you can use
`db-setup/restore-db.sh`. By default it looks in `db-setup/snapshots` and
restores from the last-modified SQL file in that directory. If that is not the
desired behavior, you can explicitly tell it which snapshot file to use:

   SNAPSHOT=db-setup/snapshots/custom-snapshot.sql db-setup/restore-db.sh

## Anonymize a database (WIP)

1. Check for sensitive fields using the detect script from PostgreSQL Anonymizer (Our script is working, but PostgreSQL Anonymizer is not, I've reported a bug (here)[https://gitlab.com/dalibo/postgresql_anonymizer/-/issues/300])
1. Generate fake data (if needed)
1. Create a db_dump from your source database using the steps described below
1. Restore anonymized database to a new database
1. Sync/Create users in Okta and Non-production testing environment

For now, to ensure access to any database created from an anonymized dump, please ensure you have an account in the source database. In the future we can use the Okta API to grant proper permissions based on need. https://github.com/CDCgov/prime-simplereport/issues/3962

Create an anonymized local database
1. run db
   1. Docker: yarn start or yarn build
1. restore the snapshot
   1. Docker db: `yarn anon:dump`
   1. Local db: `yarn anon:dump:localdb`

Restore an anonymized local postgresql dump
1. run db
   1. Docker: yarn start or yarn build
1. restore the snapshot
   1. Docker db: `yarn anon:restore`
   1. Local db: `yarn anon:restore:localdb`
1. Restart your apps

Display a list of potentially sensitive tables and columns
1. `yarn anon:detect`
1. `yarn anon:detect:localdb
