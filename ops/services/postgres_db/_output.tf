output "server_name" {
  value = azurerm_postgresql_flexible_server.db.name
}

output "server_id" {
  value = azurerm_postgresql_flexible_server.db.id
}

output "server_fqdn" {
  value = azurerm_postgresql_flexible_server.db.fqdn
}
