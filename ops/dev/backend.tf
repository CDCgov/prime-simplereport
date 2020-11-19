terraform {
  backend "azurerm" {
    resource_group_name = "prime-dev-nrobison"
    storage_account_name = "srterraform"
    container_name = "sr-tfstate"
    key = "dev/terraform.tfstate"
  }
}
