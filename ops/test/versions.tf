terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
    }
    okta = {
      source = "oktadeveloper/okta"
    }
  }
  required_version = ">= 0.13"
}
