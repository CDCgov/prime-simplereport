# Deploying SimpleReport

## Table of Contents
- [Deploying SimpleReport](#deploying-simplereport)
  - [Table of Contents](#table-of-contents)
  - [Setup](#setup)
      - [Azure](#azure)
      - [Okta](#okta)
      - [Terraform](#terraform)
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
```

#### Okta

You need to be invited to okta and be made an okta admin. Then you can create an Okta API token via
the [Okta Admin Portal](https://hhs-prime-admin.okta.com/admin/access/api/tokens).

[Okta API token docs](https://developer.okta.com/docs/guides/create-an-api-token/create-the-token/) 

Add the following line to your `~/.bash_profile`
```bash
export OKTA_API_TOKEN={Okta API token}
```
then run `source ~/.bash_profile`

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

## Reset a database

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
