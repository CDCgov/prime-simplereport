# Makefile for az cli shortcuts for SimpleReport operations

SHELL:=/bin/bash # I gave up on being compatible with ye olde "sh"
SOURCE_SLOT?=staging
TARGET_SLOT?=production
DEPLOYED_COMMIT?=$(shell git show --abbrev=7 -s --pretty=%h)

default:
	@echo "Hello, SimpleReport operator!"
	@echo "You can use 'make promote-ENV' to promote the staging slot of any environment, if you are logged in to azure"
	@echo "You can also run 'make init-ENV' or 'make deploy-ENV-api' but those may not be as useful locally."

# Internal target: check if we are currently logged in, so we get a friendly error if not
.be-logged-in:
	@if ! az account show >& /dev/null ; then echo "You must be logged in to the az command line"; exit 1; fi

# Internal target: check if the passed-in wildcard is a known environment name. Hard-coding them because let's be real here.
.valid-env-%:
	@case $* in test|dev|demo|training|pentest|stg|prod) ;; *) echo "$* is not a valid environment"; exit 1;; esac

api.tfvars: /dev/null
	echo "acr_image_tag=\"$(DEPLOYED_COMMIT)\"" > $@; \
	echo "deploy_workflow=\"${GITHUB_WORKFLOW}\"" >> $@; \
	if [[ "release" == "$(GITHUB_EVENT_NAME)" ]]; \
		then echo "deploy_tag=\"$(subst refs/tags/,,$(GITHUB_REF))\"" >> $@;\
	fi; \
	echo "deploy_runnumber=${GITHUB_RUN_NUMBER}" >> $@; \
	echo "deploy_timestamp=\"$(shell date +%Y-%m-%dT%H:%M:%S%z) \"" >> $@; \
	echo "deploy_actor=\"$(GITHUB_ACTOR)\"" >> $@;

init-%: .valid-env-%
	terraform -chdir=$* init

deploy-%-api: .valid-env-% api.tfvars
	terraform -chdir=$* apply -auto-approve -var-file=../api.tfvars -target="module.simple_report_api"

promote-%: .be-logged-in .valid-env-%
	az webapp deployment slot swap -g prime-simple-report-$* -n simple-report-api-$* --slot $(SOURCE_SLOT) --target-slot $(TARGET_SLOT)

wait-for-%: .valid-env-%
	@echo "Starting wait for $(SOURCE_SLOT) slot of $* at `date`"
	until  [[ "$(DEPLOYED_COMMIT)"  == "`curl -s https://simple-report-api-$*-$(SOURCE_SLOT).azurewebsites.net/actuator/info | jq -r .git.commit.id`" ]] ; do sleep 5; done;
	@echo "Finished waiting at `date`"
