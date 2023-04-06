output "app_hostname" {
  value = azurerm_linux_web_app.metabase.default_hostname
}

output "azurerm_linux_web_app_metabase_id" {
  value = azurerm_linux_web_app.metabase.id
}