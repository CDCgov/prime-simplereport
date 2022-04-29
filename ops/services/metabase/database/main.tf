resource "azurerm_postgresql_flexible_server_database" "metabase" {
  charset   = "UTF8"
  collation = "en_US.utf8"
  name      = "metabase"
  server_id = var.postgres_server_id
}
