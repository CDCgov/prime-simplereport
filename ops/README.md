# Deploying SimpleReport

## Table of Contents
- [Deploying SimpleReport](#deploying-simplereport)
  - [Table of Contents](#table-of-contents)
  - [Setup](#setup)
      - [Azure](#azure)
      - [Okta](#okta)
      - [Terraform](#terraform)
  - [Tasks](#tasks)
    - [Adding an env var](#adding-an-env-var)
    - [Reset a database](#reset-a-database)
  - [General steps](#general-steps)
  - [Operations performed once per environment](#operations-performed-once-per-environment)

## Setup

#### Azure

You will need to get a cdc.gov email address and access to our azure resources. Then install the Azure
CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

On Mac with homebrew
```bash
brew install azure-cli
az login
az account set --subscription "$SUB_ID"
```

`$SUB_ID` is the Subscription ID in the console when you click on the subscription. You don't technically have to set an active subscription, but Terraform won't work properly if you don't, as many permissions are subscription-based.

#### Okta

You need to be invited to okta and be made an okta admin. Then you can create an Okta API token via
the [Okta Admin Portal](https://hhs-prime-admin.okta.com/admin/access/api/tokens).

[Okta API token docs](https://developer.okta.com/docs/guides/create-an-api-token/create-the-token/) 

Add the following line to your `~/.bash_profile`
```bash
export OKTA_API_TOKEN={Okta API token}
```
then run `source ~/.bash_profile`

#### Function App Build

SimpleReport contains function app(s) which push data to our intermediary on a regular basis. These app(s) must be built and exist in the folder structure to begin executing terraform commands that reside outside of an environment's `persistent` directory.

This preparation should only need to be done once, unless major changes are made to the application's construction.

To build the function app, execute the build command from the `functions` subdirectory of the given function app's directory. For example, to build the report-stream-batched-publisher function app, run the following commands from the repository's root:

```bash
$ cd ./ops/services/app_functions/report_stream_batched_publisher/functions
$ yarn
$ yarn build:production
```

#### Terraform
Install instructions: https://learn.hashicorp.com/tutorials/terraform/install-cli

On Mac with homebrew
```bash
$ brew tap hashicorp/tap
$ brew install hashicorp/tap/terraform
```
Verify that the installation worked by opening a new terminal session and listing Terraform's available subcommands.

```bash
$ terraform help
Usage: terraform [global options] <subcommand> [args]

The available commands for execution are listed below.
The primary workflow commands are given first, followed by
less common or more advanced commands.

...
```

## Tasks

Things you may need to do for several different tasks:

- Find the commit that is currently deployed to the API in a given environment: `export SHORT_COMMIT=$(curl -s https://api-${ENVIRONMENT}.simplereport.gov/actuator/info | jq -r '.git.commit.id')`
- Find the commit of the latest tag released to production: `export SHORT_COMMIT=$(git tag --list --sort -committerdate --format='%(objectname:short=7)' | head -1)`

### Adding an env var
1. update `${ENVIRONMENT}/api.tf` and `${ENVIRONMENT}/_data_.tf`
2. cd `${ENVIRONMENT}`
3. `terraform init`
4. `terraform plan -var="acr_image_tag=${SHORT_COMMIT}" -out=plan.tfplan` (see above for the value of `SHORT_COMMIT`)
5. Review the terraform plan. NOTE: If you see a change to the azure container register url then you need to update `acr_image_tag` to the correct value
6. `terraform apply "plan.tfplan"`

### Reset a database

**DO NOT DO THIS IN THE PRODUCTION ENVIRONMENT!**

The following instructions walk through the steps to reset the database in the test environment to a
clean state. If you are doing this in different environment then replace `test` with your pre-prod
environment of choice.

1. Stop the `simple-report-api-test` app service so there are no running connections on the database. For test I also had to stop `prime-simple-report-test-metabase`
![Screen Shot 2021-02-18 at 7 11 02 PM](https://user-images.githubusercontent.com/53869143/108438453-4a3c0e80-721d-11eb-9319-e1d4b66a563c.png)
2. Run the following commands
```bash
cd ops/test/persistent
terraform init
terraform plan
# taint will mark a resource for creation by terraform and the apply step will start that action
terraform taint module.db.azurerm_postgresql_database.simple_report
terraform apply
```
Terraform works by managing the state of azure resources, so we are able to select the specific resources state we want to recreate by running `terraform state list` and get the name we want. in this case `module.db.azurerm_postgresql_database.simple_report`
3. Start the simple-report-api-test

## General steps

The initial Terraform and environment bootstrap creates a couple of resource which are shared across the various resource groups and environments.

0. Reach out to infrastructure team to for the default parameters
0. Create storage account in Azure
0. Create the storage container
0. `terraform init`
0. Import the container into the state
```bash
terraform import azurerm_storage_container.state_container https://srterraform.blob.core.windows.net/sr-tfstate
terraform plan -var-file="params.tfvars"
terraform apply -var-file="params.tfvars"
```

## Operations performed once per environment

First, we need to deploy the persistent services (DBs, etc) which should not be re-created on each deploy
```bash
cd {environment}/persistent
terraform init
terraform apply
```

Next, we deploy the stateless services that can easily be torndown and created again.
```bash
cd {environment}
terraform init
terraform apply
```
 
