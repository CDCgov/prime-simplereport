output "server_name" {
  value = azurerm_postgresql_server.db.name
}

output "server_fqdn" {
  value = azurerm_postgresql_server.db.fqdn
}
