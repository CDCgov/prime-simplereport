resource "azurerm_key_vault_secret" "db_username" {
  key_vault_id = var.global_vault_id
  name         = "simple-report-${var.env}-db-username"
  value        = var.administrator_login
}

resource "azurerm_key_vault_secret" "db_password" {
  name         = "simple-report-${var.env}-db-password"
  key_vault_id = var.global_vault_id
  value        = var.administrator_password
}

resource "azurerm_key_vault_secret" "jdbc" {
  name         = "simple-report-${var.env_level}-db-jdbc"
  key_vault_id = var.global_vault_id
  value        = "jdbc:postgresql://${azurerm_postgresql_flexible_server.db.name}.postgres.database.azure.com:5432/${var.administrator_login}?user=${var.administrator_login}&password=${var.administrator_password}&sslmode=require"
}

resource "azurerm_key_vault_secret" "metabase_uri" {
  name         = "simple-report-${var.env_level}-db-metabase-uri"
  key_vault_id = var.global_vault_id
  value        = "jdbc:postgresql://${azurerm_postgresql_flexible_server.db.name}.postgres.database.azure.com:5432/metabase?user=${var.administrator_login}&password=${var.administrator_password}&sslmode=require"
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
