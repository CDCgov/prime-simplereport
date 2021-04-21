# Makefile for az cli shortcuts for SimpleReport operations

SOURCE_SLOT?=staging
TARGET_SLOT?=production

default:
	@echo "Hello, SimpleReport operator!"
	@echo "You can use 'make promote-ENV' to promote the staging slot of any environment, if you are logged in to azure"

.be-logged-in:
	@if ! az account show >& /dev/null ; then echo "You must be logged in to the az command line"; exit 1; fi

.valid-env-%:
	@case $* in test|dev|demo|training|pentest|stg|prod) ;; *) echo "$* is not a valid environment"; exit 1;; esac

promote-%: .be-logged-in .valid-env-%
	az webapp deployment slot swap -g prime-simple-report-$* -n simple-report-api-$* --slot $(SOURCE_SLOT) --target-slot $(TARGET_SLOT)
