#!/bin/bash

if [[ -n $LIQUIBASE_ROLLBACK_TAG ]];
    then
        echo "***************************************************************"
        echo "Rollback tag provided! Rolling back to: $LIQUIBASE_ROLLBACK_TAG"
        echo "***************************************************************"

        gradle -Dorg.gradle.java.home=$JAVA_HOME liquibaseRollback -PliquibaseCommandValue="$LIQUIBASE_ROLLBACK_TAG"
    else
        echo "*******************************************"
        echo "No rollback tag provided! Taking no action."
        echo "*******************************************"
fi