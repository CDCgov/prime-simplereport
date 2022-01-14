module "okta" {
  source                      = "../../services/okta-app"
  env                         = local.env
  logout_redirect_uris        = ["https://${local.env}.simplereport.gov"]
  app_url                     = "https://${local.env}.simplereport.gov/app"
  trusted_origin_preview_urls = []
}

// Create the Okta secrets

resource "azurerm_key_vault_secret" "okta_client_id" {
  key_vault_id = data.azurerm_key_vault.global.id
  name         = "okta-${local.env}-client-id"
  value        = module.okta.client_id

  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "okta_client_secret" {
  key_vault_id = data.azurerm_key_vault.global.id
  name         = "okta-${local.env}-client-secret"
  value        = module.okta.client_secret

  lifecycle {
    ignore_changes = [value]
  }
}

resource "okta_trusted_origin" "sr_trusted_origin" {
  count  = length(module.okta.trusted_origin_preview_urls)
  name   = element(element(module.okta.trusted_origin_preview_urls, count.index), 0)
  origin = element(element(module.okta.trusted_origin_preview_urls, count.index), 1)
  scopes = element(element(module.okta.trusted_origin_preview_urls, count.index), 2)
}
