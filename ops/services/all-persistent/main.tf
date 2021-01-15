locals {
  management_tags = {
    prime-app   = "simplereport"
    environment = var.env
  }
  management_rg = "prime-simple-report-management"
  is_prod       = var.env == "prod"
  app_url       = local.is_prod ? "https://simplereport.gov/app" : "https://${var.env}.simplereport.gov/app"
}

data "azurerm_resource_group" "rg" {
  name = "prime-simple-report-${var.env}"
}

data "azurerm_key_vault" "kv" {
  name                = "simple-report-global"
  resource_group_name = var.management_rg
}

// Okta application

module "okta" {
  source               = "../../services/okta-app"
  env                  = var.env
  app_url              = local.app_url
  redirect_urls        = []
  logout_redirect_uris = local.is_prod ? "https://simplereport.gov" : "https://${var.env}.simplereport.gov"
}

// Create the Okta secrets

resource "azurerm_key_vault_secret" "okta_client_id" {
  key_vault_id = data.azurerm_key_vault.kv.id
  name         = "okta-${var.env}-client-id"
  value        = module.okta.client_id

  lifecycle {
    ignore_changes = [
    value]
  }
}

resource "azurerm_key_vault_secret" "okta_client_secret" {
  key_vault_id = data.azurerm_key_vault.kv.id
  name         = "okta-${var.env}-client-secret"
  value        = module.okta.client_secret

  lifecycle {
    ignore_changes = [
    value]
  }
}
