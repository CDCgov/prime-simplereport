module "okta" {
  source               = "../../services/okta-app"
  env                  = local.env
  logout_redirect_uris = ["https://${local.env}.simplereport.gov"]
  app_url              = "https://${local.env}.simplereport.gov/app"
  redirect_urls        = []
  trusted_origins = [
    {
      name   = "SimpleReport Staging Env",
      url    = "https://stg.simplereport.gov",
      scopes = ["CORS, REDIRECT"]
    }
  ]
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
