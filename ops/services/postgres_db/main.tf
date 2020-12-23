# NOTE
# you'll need to enable encryption manually via the GUI
resource "azurerm_postgresql_server" "db" {
  name                          = "simple-report-${var.env}-db"
  location                      = var.rg_location
  resource_group_name           = var.rg_name
  sku_name                      = "GP_Gen5_4"
  version                       = "11"
  ssl_enforcement_enabled       = var.tls_enabled
  public_network_access_enabled = true

  administrator_login          = var.administrator_login
  administrator_login_password = azurerm_key_vault_secret.db_password.value

  storage_mb                   = 102400
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled            = true

  tags = var.tags

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

# These parameters and names need to be exact: https://github.com/MicrosoftDocs/azure-docs/issues/20758
# It looks like this only works if we enable public access. Otherwise, we need to use virtual network rules.
//resource "azurerm_postgresql_firewall_rule" "all" {
//  name = "AllowAllAzureIps"
//  resource_group_name = var.rg_name
//  server_name = azurerm_postgresql_server.db.name
//  start_ip_address = "0.0.0.0"
//  end_ip_address = "0.0.0.0"
//}