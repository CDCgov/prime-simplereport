output "blob_ip_address" {
  value = azurerm_storage_account.frontend.primary_web_host
}
