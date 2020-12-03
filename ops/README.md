# Deploying SimpleReport

## Operations that only need to be performed once

### Authentication

#### Azure

Azure auth is really simple and only requires installing Azure CLI and logging in.

```bash
brew install azure-cli
az login
```

#### Okta

[Okta API tokens0](https://developer.okta.com/docs/guides/create-an-api-token/create-the-token/) are assigned at the environment level, and not on a per user basis.
You can create one for yourself [here](https://prime-eval-admin.okta.com/admin/access/api/tokens).

```bash
export OKTA_ORG_NAME=<okta_org>
export OKTA_BASE_URL="okta.com"
export OKTA_API_TOKEN={Okta API token}
```

### General steps

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
