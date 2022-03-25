module "okta" {
  source               = "../../services/okta-app"
  env                  = local.env
  app_url              = "https://www.simplereport.gov/app"
  logout_redirect_uris = ["https://simplereport.cdc.gov", "https://www.simplereport.gov"]
  trusted_origins = [
    {
      name   = "SimpleReport Prod Env",
      url    = "https://simplereport.gov",
      scopes = ["CORS, REDIRECT"]
    },
    {
      name   = "SimpleReport Prod Env (www)",
      url    = "https://www.simplereport.gov",
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
