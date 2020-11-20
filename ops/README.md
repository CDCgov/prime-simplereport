# Deploying SimpleReport

## Operations that only need to be performed once

The initial Terraform and environment bootstrap creates a couple of resource which are shared across the various resource groups and environments.

0. Create storage account in Azure
0. Create the storage container
0. `terraform init`
0. Import the container into the state
```bash
terraform import azurerm_storage_container.state_container https://srterraform.blob.core.windows.net/sr-tfstate
terraform apply
```

### Operations performed once per environment

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
