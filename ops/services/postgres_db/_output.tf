output "server_name" {
  value = azurerm_postgresql_server.db.name
}

output "server_id" {
  value = azurerm_postgresql_server.db.id
}
