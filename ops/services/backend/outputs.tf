output "gateway_ip" {
  value = azurerm_public_ip.backend.ip_address
}
