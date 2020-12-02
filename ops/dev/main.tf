provider "azurerm" {
  version = "~>2.0"
  features {}
  skip_provider_registration = true
}

module "all" {
  source = "../services/all-ephemeral"
  docker_tag = var.docker_tag
  env = "dev"
}
