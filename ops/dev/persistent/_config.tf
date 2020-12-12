terraform {
  backend "azurerm" {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "dev/persistent-terraform.tfstate"
  }
}

provider "azurerm" {
  version = "~>2.0"
  features {}
  skip_provider_registration = true
}

provider "okta" {
  org_name = "hhs-prime"
  base_url = "okta.com"
}