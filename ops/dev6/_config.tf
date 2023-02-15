terraform {
  backend "azurerm" {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "dev6/terraform.tfstate"
  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.34"
    }
  }
  required_version = "~> 1.3.3"
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}
