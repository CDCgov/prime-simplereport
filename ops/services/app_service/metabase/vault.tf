resource "azurerm_key_vault_secret" "postgres_readonly_user" {
  key_vault_id = var.global_vault_id
  name         = "simple-report-${var.env}-postgres_readonly_user"
  value        = "readonly"
}

resource "azurerm_key_vault_secret" "postgres_readonly_pass" {
  key_vault_id = var.global_vault_id
  name         = "simple-report-${var.env}-postgres-readonly-pass"
  value        = random_password.random_readonly_password.result
}

resource "random_password" "random_readonly_password" {
  length           = 30
  special          = false
  override_special = "!#$%&*()-_=+[]{}<>:?"
}