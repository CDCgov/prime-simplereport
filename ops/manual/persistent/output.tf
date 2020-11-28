output "dns_name" {
  value = azurerm_postgresql_server.db.fqdn
}

output "server_id" {
  value = azurerm_postgresql_server.db.id
}
