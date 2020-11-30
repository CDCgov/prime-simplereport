provider "azurerm" {
  version = "~>2.0"
  features {}
  skip_provider_registration = true
}

provider "okta" {
  org_name = "hhs-prime"
  base_url = "okta.com"
}

module "all" {
  source = "../../services/all-persistent"
  env = "dev"
}
