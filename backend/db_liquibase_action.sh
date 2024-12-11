#!/bin/bash

# Set LIQUIBASE_ACTION to one of the following:
#   validate
#   clear-checksums
#   rollback
#   (default) no action
# if LIQUIBASE_ACTION is set to rollback, set LIQUIBASE_ROLLBACK_TAG
rollback_tag="$LIQUIBASE_ROLLBACK_TAG"
action="$LIQUIBASE_ACTION"

case "${action}" in
  validate)
    echo "Validating..."
    gradle liquibaseValidate
    ;;
    
  clear-checksums)
    echo "Clearing checksums..."
    gradle liquibaseClearCheckSums
    ;;
    
  rollback)
    echo "Rolling back to tag: ${rollback_tag}"
    gradle liquibaseRollback -PliquibaseTag="${rollback_tag}"
    ;;
    
  *) # default condition
    echo "No valid action provided! Taking no action."
    exit 0
    ;;
esac
