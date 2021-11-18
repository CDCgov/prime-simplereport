terraform {
  backend "azurerm" {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "global/terraform.tfstate"
  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>2.84.0"
    }
    okta = {
      source  = "okta/okta"
      version = "~>3.19.0"
    }
    pagerduty = {
      source  = "pagerduty/pagerduty"
      version = "~>2.1.1"
    }
  }
  required_version = ">=1.0.11"
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}

provider "okta" {
  org_name = "hhs-prime"
  base_url = var.okta_base_url
}
