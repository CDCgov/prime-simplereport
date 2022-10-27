terraform {
  backend "azurerm" {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "dev5/persistent-terraform.tfstate"
  }
}

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 2.92.0"
    }
    okta = {
      source  = "okta/okta"
      version = "~> 3.19"
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
