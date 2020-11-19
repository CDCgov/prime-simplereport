resource "azurerm_postgresql_server" "db" {
  name = "pdi-db-nrobison"
  location = var.resource_group_location
  resource_group_name = var.resource_group
  sku_name = "GP_Gen5_4"
  version = "11"
  ssl_enforcement_enabled = false
  administrator_login = "simple_report_app"
  administrator_login_password = "H@Sh1CoR3!"
  public_network_access_enabled = true
}

resource "azurerm_postgresql_database" "simple_report" {
  charset = "UTF8"
  collation = "English_United States.1252"
  name = "simple_report"
  resource_group_name = var.resource_group
  server_name = azurerm_postgresql_server.db.name
}

# These parameters and names need to be exact: https://github.com/MicrosoftDocs/azure-docs/issues/20758
resource "azurerm_postgresql_firewall_rule" "all" {
  name = "AllowAllAzureIps"
  resource_group_name = var.resource_group
  server_name = azurerm_postgresql_server.db.name
  start_ip_address = "0.0.0.0"
  end_ip_address = "0.0.0.0"
}
