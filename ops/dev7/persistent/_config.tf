terraform {
  backend "azurerm" {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "dev7/persistent-terraform.tfstate"
  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.44"
    }
    okta = {
      source  = "okta/okta"
      version = "~> 3.39"
    }
    random = {
      version = "~> 3.4"
    }
  }
  required_version = "~> 1.3.3"
}


provider "azurerm" {
  features {}
  skip_provider_registration = true
}

provider "okta" {
  org_name = "hhs-prime"
  base_url = "oktapreview.com"
}
