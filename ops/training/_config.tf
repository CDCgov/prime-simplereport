terraform {
  backend "azurerm" {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "training/terraform.tfstate"
  }
}

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>2.84"
    }
  }
  required_version = "~>1.0.11"
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}

