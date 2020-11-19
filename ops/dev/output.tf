output "dns" {
  value = azurerm_container_group.backend[0].fqdn
}
