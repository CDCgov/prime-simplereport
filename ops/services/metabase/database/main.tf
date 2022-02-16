resource "azurerm_postgresql_database" "metabase" {
  charset             = "UTF8"
  collation           = "English_United States.1252"
  name                = "metabase"
  resource_group_name = var.resource_group_name
  server_name         = var.postgres_server_name
}
