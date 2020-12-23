# Creates random password for the database
resource "azurerm_key_vault_secret" "db_username" {
  key_vault_id = var.global_vault_id
  name         = "simple-report-${var.env}-db-username"
  value        = var.administrator_login
}

resource "azurerm_key_vault_secret" "db_password" {
  key_vault_id = var.global_vault_id
  name         = "simple-report-${var.env}-db-password"
  value        = random_password.random_db_password.result
}

resource "random_password" "random_db_password" {
  length           = 30
  special          = false
  override_special = "!#$%&*()-_=+[]{}<>:?"
}