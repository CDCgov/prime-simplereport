# Makefile for az cli shortcuts for SimpleReport operations

SHELL:=/bin/bash # I gave up on being compatible with ye olde "sh"
SOURCE_SLOT?=staging
TARGET_SLOT?=production
DEPLOYED_COMMIT?=$(shell git show --abbrev=7 -s --pretty=%h)

default:
	@echo "Hello, SimpleReport operator!"
	@echo "You can use 'make promote-ENV' to promote the staging slot of any environment, if you are logged in to azure"

# Internal target: check if we are currently logged in, so we get a friendly error if not
.be-logged-in:
	@if ! az account show >& /dev/null ; then echo "You must be logged in to the az command line"; exit 1; fi

# Internal target: check if the passed-in wildcard is a known environment name. Hard-coding them because let's be real here.
.valid-env-%:
	@case $* in test|dev|demo|training|pentest|stg|prod) ;; *) echo "$* is not a valid environment"; exit 1;; esac

promote-%: .be-logged-in .valid-env-%
	az webapp deployment slot swap -g prime-simple-report-$* -n simple-report-api-$* --slot $(SOURCE_SLOT) --target-slot $(TARGET_SLOT)

wait-for-%: .valid-env-%
	@echo "Starting wait for $(SOURCE_SLOT) slot of $* at `date`"
	until  [[ "$(DEPLOYED_COMMIT)"  == "`curl -s https://simple-report-api-$*-$(SOURCE_SLOT).azurewebsites.net/actuator/info | jq -r .git.commit.id`" ]] ; do sleep 5; done;
	@echo "Finished waiting at `date`"
