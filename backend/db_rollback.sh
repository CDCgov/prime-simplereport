#!/bin/bash

# Use shorter names for the environment variables
tag="$LIQUIBASE_ROLLBACK_TAG"
count="$LIQUIBASE_ROLLBACK_COUNT"

if [ -n "$tag" ]; then
  echo "Rolling back to tag: $tag"
  gradle liquibaseRollback -PliquibaseCommandValue=$tag
elif [ -n "$count" ]; then
  echo "Rolling back by count: $count"
  gradle liquibaseRollbackCount -PliquibaseCommandValue=$count
else
  echo "No rollback tag or count provided! Taking no action."
  exit 0
fi
