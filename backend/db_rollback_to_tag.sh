#!/bin/bash

if [[ -n $LIQUIBASE_ROLLBACK_TAG ]];
    then
        echo "***************************************************************"
        echo "Rollback tag provided! Rolling back to: $LIQUIBASE_ROLLBACK_TAG"
        echo "***************************************************************"

        # Roll back to the provided tag
        gradle liquibaseRollback -PliquibaseCommandValue="$LIQUIBASE_ROLLBACK_TAG"
    else
        echo "*******************************************"
        echo "No rollback tag provided! Taking no action."
        echo "*******************************************"
fi