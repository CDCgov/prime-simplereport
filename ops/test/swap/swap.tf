terraform {
    required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "~>2.0"
    }
  }
}

provider "azurerm" { 
    features {}
    skip_provider_registration = true # but why?
}

resource "azurerm_app_service_active_slot" "promote_staging" {
  resource_group_name   = "prime-simple-report-test"
  app_service_name      = "simple-report-api-test"
  app_service_slot_name = "staging"
}
