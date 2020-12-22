provider "azurerm" {
  features {}
  skip_provider_registration = true
}

provider "okta" {
  org_name = "hhs-prime"
  base_url = "okta.com"
}

locals {
  management_tags = {
    prime-app   = "simplereport"
    environment = "prod"
  }
}

module "all" {
  source = "../../services/all-persistent"
  env    = local.management_tags.environment
}
