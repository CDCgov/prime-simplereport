#!/bin/bash

# Pick and set one of these environment variables
rollback_tag="$LIQUIBASE_ROLLBACK_TAG"
action="$LIQUIBASE_ACTION"

case "${action}" in
  validate)
    echo "Validating..."
    gradle liquibaseValidate
    ;;
    
  clear_checksums)
    echo "Clearing checksums..."
    gradle liquibaseClearCheckSums
    ;;
    
  rollback)
    echo "Rolling back to tag: ${rollback_tag}"
    gradle liquibaseRollback -PliquibaseCommandValue="${rollback_tag}"
    ;;
    
  *) # default condition
    echo "No valid action provided! Taking no action."
    exit 0
    ;;
esac
