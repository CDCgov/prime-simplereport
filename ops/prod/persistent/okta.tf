module "okta" {
  source               = "../../services/okta-app"
  env                  = local.env
  app_url              = "https://www.simplereport.gov/app"
  logout_redirect_uris = ["https://simplereport.cdc.gov", "https://www.simplereport.gov"]
}

// Create the Okta secrets

resource "azurerm_key_vault_secret" "okta_client_id" {
  key_vault_id = data.azurerm_key_vault.global.id
  name         = "okta-${local.env}-client-id"
  value        = module.okta.client_id

  lifecycle {
    ignore_changes = [
    value]
  }
}

resource "azurerm_key_vault_secret" "okta_client_secret" {
  key_vault_id = data.azurerm_key_vault.global.id
  name         = "okta-${local.env}-client-secret"
  value        = module.okta.client_secret

  lifecycle {
    ignore_changes = [
    value]
  }
}

resource "okta_trusted_origin" "sr_trusted_origin" {
  count  = length(var.trusted_origin_urls)
  name   = element(element(var.trusted_origin_urls, count.index), 0)
  origin = element(element(var.trusted_origin_urls, count.index), 1)
  scopes = element(element(var.trusted_origin_urls, count.index), 2)
}
