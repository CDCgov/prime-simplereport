// TODO - change these to azurerm_postgresql_flexible_server when removing the old DB config

output "server_name" {
  value = azurerm_postgresql_server.db.name
}

output "server_id" {
  value = azurerm_postgresql_server.db.id
}

output "flexible_server_id" {
  value = azurerm_postgresql_flexible_server.db.id
}

output "server_fqdn" {
  value = azurerm_postgresql_server.db.fqdn
}
