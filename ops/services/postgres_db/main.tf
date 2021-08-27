# NOTE
# you'll need to enable encryption manually via the GUI
resource "azurerm_postgresql_server" "db" {
  name                          = "simple-report-${var.env}-db"
  location                      = var.rg_location
  resource_group_name           = var.rg_name
  sku_name                      = "GP_Gen5_4"
  version                       = "11"
  ssl_enforcement_enabled       = var.tls_enabled
  public_network_access_enabled = false

  administrator_login          = var.administrator_login
  administrator_login_password = data.azurerm_key_vault_secret.db_password.value

  storage_mb                   = 102400
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled            = true

  tags = var.tags

  threat_detection_policy {
    enabled              = true
    email_account_admins = true
  }

  lifecycle {
    ignore_changes = [
      identity
    ]
  }
}

resource "azurerm_postgresql_database" "simple_report" {
  charset             = "UTF8"
  collation           = "English_United States.1252"
  name                = var.db_table
  resource_group_name = var.rg_name
  server_name         = azurerm_postgresql_server.db.name
}

resource "azurerm_postgresql_configuration" "log_autovacuum_min_duration" {
  name                = "log_autovacuum_min_duration"
  resource_group_name = var.rg_name
  server_name         = azurerm_postgresql_server.db.name
  value               = 0
}