resource "azurerm_key_vault_secret" "postgres_nophi_user" {
  key_vault_id = var.global_vault_id
  name         = "simple-report-${var.env}-postgres_nophi_user"
  value        = "nophi"
}

resource "azurerm_key_vault_secret" "postgres_nophi_pass" {
  key_vault_id = var.global_vault_id
  name         = "simple-report-${var.env}-postgres-nophi-pass"
  value        = random_password.random_nophi_password.result
}

resource "random_password" "random_nophi_password" {
  length           = 30
  special          = false
  override_special = "!#$%&*()-_=+[]{}<>:?"
}