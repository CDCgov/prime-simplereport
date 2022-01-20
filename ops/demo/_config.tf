terraform {
  backend "azurerm" {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "demo/terraform.tfstate"
  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>2.84"
    }
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}