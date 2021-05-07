output "app_gateway_hostname" {
  value     = azurerm_application_gateway.load_balancer
  sensitive = true
}

output "app_gateway_public_ip" {
  value = azurerm_public_ip.static_gateway.id
}