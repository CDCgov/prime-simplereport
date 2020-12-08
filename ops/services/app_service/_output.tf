output "app_object_id" {
  value = azurerm_app_service.service.identity[0].principal_id
}

output "app_hostname" {
  value = azurerm_app_service.service.default_site_hostname
}

output "app_ip_addr" {
  value = split(",", azurerm_app_service.service.outbound_ip_addresses)
}