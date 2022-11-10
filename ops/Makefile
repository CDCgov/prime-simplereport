# Makefile for az cli shortcuts for SimpleReport operations

SHELL:=/bin/bash # I gave up on being compatible with ye olde "sh"

# Overrideable arguments
SOURCE_SLOT?=staging
TARGET_SLOT?=production
DEPLOYED_COMMIT?=$(shell git show --abbrev=7 -s --pretty=%h)
RELEASE_TAG?=$(subst refs/tags/,,$(GITHUB_REF))
CURL_TIMEOUT?=20

# Internal DRYing (also overrideable if you are sufficiently desperate)
API_NAME=simple-report-api-$*
INFO_ENDPOINT=https://$(API_NAME).simplereport.gov/api/actuator/info
PROD_INFO_ENDPOINT=https://www.simplereport.gov/api/actuator/info
SLOT_INFO_ENDPOINT=https://$*.simplereport.gov/staging/api/actuator/info
PROD_SLOT_INFO_ENDPOINT=https://www.simplereport.gov/staging/api/actuator/info
CURL:=curl --silent --fail --max-time $(CURL_TIMEOUT)
APP_READY=$(CURL) https://$*.simplereport.gov/api/actuator/health/readiness > /dev/null
PROD_APP_READY=$(CURL) https://www.simplereport.gov/api/actuator/health/readiness > /dev/null
SLOT_READY=$(CURL) https://$*.simplereport.gov/staging/api/actuator/health/readiness > /dev/null
PROD_SLOT_READY =$(CURL) https://www.simplereport.gov/staging/api/actuator/health/readiness > /dev/null

default:
	@echo "Hello, SimpleReport operator!"
	@echo "You can use 'make promote-ENV' to promote the $(SOURCE_SLOT) slot of any environment, if you are logged in to azure"
	@echo "You can also run 'make init-ENV' or 'make deploy-ENV' but those may not be as useful locally."
	@echo "In addition, there are a variety of targets that start with 'check' or 'wait-for', which you should just look at."
	@echo "Please note in particular that most if not all 'wait' tasks do not have a built-in timeout."

# Internal target: check if we are currently logged in, so we get a friendly error if not
.be-logged-in:
	@if ! az account show >& /dev/null ; then echo "You must be logged in to the az command line"; exit 1; fi

# Internal target: check if the passed-in wildcard is a known environment name. Hard-coding them because let's be real here.
.valid-env-%:
	@case $* in test|dev|dev2|dev3|dev4|dev5|dev6|dev7|demo|training|pentest|stg|prod) ;; *) echo "$* is not a valid environment"; exit 1;; esac

api.tfvars: /dev/null
	echo "acr_image_tag=\"$(DEPLOYED_COMMIT)\"" > $@; \
	echo "deploy_workflow=\"${GITHUB_WORKFLOW}\"" >> $@; \
	if [[ "release" == "$(GITHUB_EVENT_NAME)" ]]; \
		then echo "deploy_tag=\"$(RELEASE_TAG)\"" >> $@;\
	fi; \
	echo "deploy_runnumber=${GITHUB_RUN_NUMBER}" >> $@; \
	echo "deploy_timestamp=\"$(shell date +%Y-%m-%dT%H:%M:%S%z) \"" >> $@; \
	echo "deploy_actor=\"$(GITHUB_ACTOR)\"" >> $@;

# init-%: .valid-env-%
# 	terraform -chdir=$*/persistent init
# 	terraform -chdir=$* init

init-%: .valid-env-%
	terraform -chdir=$*/persistent init
	terraform -chdir=$* init

# Passes the -upgrade and -migration flags to terraform init
# init-%: .valid-env-%
# 	terraform -chdir=$*/persistent init -upgrade -migrate-state
# 	terraform -chdir=$* init -upgrade -migrate-state

plan-%: .valid-env-% api.tfvars
	terraform -chdir=$*/persistent plan -lock-timeout=30m
	terraform -chdir=$* plan -var-file=../api.tfvars -lock-timeout=30m

deploy-%: .valid-env-% api.tfvars
	terraform -chdir=$*/persistent apply -auto-approve -lock-timeout=30m
	terraform -chdir=$* apply -auto-approve -var-file=../api.tfvars -lock-timeout=30m

promote-%: .be-logged-in .valid-env-%
	@case $* in dev2|dev3|dev4|dev5|dev6|dev7) az webapp deployment slot swap -g prime-simple-report-dev -n $(API_NAME) --slot $(SOURCE_SLOT) --target-slot $(TARGET_SLOT) ;; *) az webapp deployment slot swap -g prime-simple-report-$* -n $(API_NAME) --slot $(SOURCE_SLOT) --target-slot $(TARGET_SLOT) ;; esac

wait-for-%-slot-commit: .valid-env-%
	@echo "Starting wait for commit $(DEPLOYED_COMMIT) in $(SOURCE_SLOT) slot of $* at `date`"
	if [[ "$*" == "prod" ]] ; then \
	  until  [[ "$(DEPLOYED_COMMIT)"  == "`$(CURL) $(PROD_SLOT_INFO_ENDPOINT) | jq -r .git.commit.id`" ]] ; do sleep 5; done; \
	else \
	  until  [[ "$(DEPLOYED_COMMIT)"  == "`$(CURL) $(SLOT_INFO_ENDPOINT) | jq -r .git.commit.id`" ]] ; do sleep 5; done; \
	fi;
	@echo "Finished waiting at `date`"

wait-for-%-commit: .valid-env-%
	@echo "Starting wait for commit $(DEPLOYED_COMMIT) in $* at `date`"
	if [[ "$*" == "prod" ]] ; then \
	  until  [[ "$(DEPLOYED_COMMIT)"  == "`$(CURL) $(PROD_INFO_ENDPOINT) | jq -r .git.commit.id`" ]] ; do sleep 5; done; \
	else \
	  until  [[ "$(DEPLOYED_COMMIT)"  == "`$(CURL) $(INFO_ENDPOINT) | jq -r .git.commit.id`" ]] ; do sleep 5; done; \
	fi;
	@echo "Finished waiting at `date`"

wait-for-%-release: .valid-env-%
	@echo "Starting wait for release $(RELEASE_TAG) in $* at `date`"
	if [[ "$*" == "prod" ]] ; then \
	  until [[ "$(RELEASE_TAG)"  == "`$(CURL) $(PROD_INFO_ENDPOINT) | jq -r .deploy.tag`" ]]; do sleep 5; done ; \
	else \
	  until [[ "$(RELEASE_TAG)"  == "`$(CURL) $(INFO_ENDPOINT) | jq -r .deploy.tag`" ]]; do sleep 5; done ; \
	fi;
	@echo "Finished waiting at `date`"

wait-for-%-slot-release: .valid-env-%
	@echo "Starting wait for release $(RELEASE_TAG) in $* at `date`"
	if [[ "$*" == "prod" ]] ; then \
	  until [[ "$(RELEASE_TAG)"  == "`$(CURL) $(PROD_SLOT_INFO_ENDPOINT) | jq -r .deploy.tag`" ]]; do sleep 5; done ; \
	else \
	  until [[ "$(RELEASE_TAG)"  == "`$(CURL) $(SLOT_INFO_ENDPOINT) | jq -r .deploy.tag`" ]]; do sleep 5; done ; \
	fi;
	@echo "Finished waiting at `date`"

wait-for-%-slot-readiness: .valid-env-% # could use curl's built-in retry/timeout if we wanted to
	@echo "Waiting for a successful readiness probe in $*/$(SOURCE_SLOT)"
	if [[ "$*" == "prod" ]] ; then \
	  until $(PROD_SLOT_READY); do sleep 5; done; \
	else \
	  until $(SLOT_READY); do sleep 5; done; \
	fi;

wait-for-%-readiness: .valid-env-% # could use curl's built-in retry/timeout if we wanted to
	@echo "Waiting for a successful readiness probe in $*"
	if [[ "$*" == "prod" ]] ; then \
	  until $(PROD_APP_READY); do sleep 5; done; \
	else \
	  until $(APP_READY); do sleep 5; done; \
	fi;

check-%-slot-commit: .valid-env-%
	@echo Checking that $(DEPLOYED_COMMIT) is the current deployed commit for $*/$(SOURCE_SLOT)
	if [[ "$*" == "prod" ]] ; then \
	  [[ "$(DEPLOYED_COMMIT)"  == "`$(CURL) $(PROD_SLOT_INFO_ENDPOINT) | jq -r .git.commit.id`" ]] ; \
	else \
	  [[ "$(DEPLOYED_COMMIT)"  == "`$(CURL) $(SLOT_INFO_ENDPOINT) | jq -r .git.commit.id`" ]] ; \
	fi;

check-%-commit: .valid-env-%
	@echo Checking that $(DEPLOYED_COMMIT) is the current deployed commit for $*
	if [[ "$*" == "prod" ]] ; then \
	  [[ "$(DEPLOYED_COMMIT)"  == "`$(CURL) $(PROD_INFO_ENDPOINT) | jq -r .git.commit.id`" ]] ; \
	else \
	  [[ "$(DEPLOYED_COMMIT)"  == "`$(CURL) $(INFO_ENDPOINT) | jq -r .git.commit.id`" ]] ; \
	fi;

check-%-slot-release: .valid-env-%
	@echo Checking that $(RELEASE_TAG) is the current release on $*/$(SOURCE_SLOT)
	if [[ "$*" == "prod" ]] ; then \
	  [[ "$(RELEASE_TAG)"  == "`$(CURL) $(PROD_SLOT_INFO_ENDPOINT) | jq -r .deploy.tag`" ]] ; \
	else \
	  [[ "$(RELEASE_TAG)"  == "`$(CURL) $(SLOT_INFO_ENDPOINT) | jq -r .deploy.tag`" ]] ; \
	fi;

check-%-release: .valid-env-%
	@echo Checking that $(RELEASE_TAG) is the current release on $*
	if [[ "$*" == "prod" ]] ; then \
	  [[ "$(RELEASE_TAG)"  == "`$(CURL) $(PROD_INFO_ENDPOINT) | jq -r .deploy.tag`" ]] ; \
	else \
	  [[ "$(RELEASE_TAG)"  == "`$(CURL) $(INFO_ENDPOINT) | jq -r .deploy.tag`" ]] ; \
	fi;

check-%-slot-readiness: .valid-env-%
	@echo Checking the readiness probe for $*/$(SOURCE_SLOT)
	if [[ "$*" == "prod" ]] ; then \
	  $(PROD_SLOT_READY) ; \
	else \
	  $(SLOT_READY) ; \
	fi;

check-%-readiness: .valid-env-%
	@echo Checking the readiness probe for $*
	if [[ "$*" == "prod" ]] ; then \
	  $(PROD_APP_READY) ; \
	else \
	  $(APP_READY) ; \
	fi;

# DEPRECATED: This is too greedy a match, replacing it
wait-for-%: .valid-env-%
	@echo "Starting wait for commit $(DEPLOYED_COMMIT) in $(SOURCE_SLOT) slot of $* at `date`"
	until  [[ "$(DEPLOYED_COMMIT)"  == "`$(CURL) $(SLOT_INFO_ENDPOINT) | jq -r .git.commit.id`" ]] ; do sleep 5; done;
	@echo "Finished waiting at `date`"
