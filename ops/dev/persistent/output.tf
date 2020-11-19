output "dns_name" {
  value = azurerm_postgresql_server.db.fqdn
}
