terraform {
  backend "azurerm" {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "dev2/persistent-terraform.tfstate"
  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.22.0"
    }
    okta = {
      source  = "okta/okta"
      version = "~> 4.3.0"
    }
    random = {
      version = "~> 3.5"
    }
  }
  required_version = "~> 1.9.6"
}


provider "azurerm" {
  features {}
  skip_provider_registration = true
}

provider "okta" {
  org_name = "hhs-prime"
  base_url = "oktapreview.com"
}
