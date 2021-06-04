# Creates random password for the database
resource "azurerm_key_vault_secret" "db_username" {
  key_vault_id = var.global_vault_id
  name         = "simple-report-${var.env}-db-username"
  value        = var.administrator_login
}

data "azurerm_key_vault_secret" "db_password" {
  name         = "simple-report-${var.env}-db-password"
  key_vault_id = var.global_vault_id
}

# Create the no-PHI user
resource "azurerm_key_vault_secret" "db_username_no_phi" {
  key_vault_id = var.global_vault_id
  name         = "simple-report-${var.env}-db-username-no-phi"
  value        = "simple_report_no_phi"
}

resource "azurerm_key_vault_secret" "db_password_no_phi" {
  key_vault_id = var.global_vault_id
  name         = "simple-report-${var.env}-db-password-no-phi"
  value        = var.nophi_user_password
}
