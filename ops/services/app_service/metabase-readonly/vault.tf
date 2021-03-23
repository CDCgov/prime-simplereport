# Creates random password for the readonly database user
resource "azurerm_key_vault_secret" "postgres_readonly_user" {
  key_vault_id = var.global_vault_id
  name         = "simple-report-${var.env}-postgres_readonly_user"
  value        = "readonly"
}

data "azurerm_key_vault_secret" "postgres_readonly_pass" {
  name         = "simple-report-${var.env}-postgres_readonly_pass"
  key_vault_id = var.global_vault_id
}

# We could also set this as a random password, as is done in
# ops/services/database/main.tf
# If this is kept non-random, we'll need to manually add it as a secret to the Vault (requires an 
# Azure login: https://docs.microsoft.com/en-us/azure/key-vault/secrets/quick-create-cli)