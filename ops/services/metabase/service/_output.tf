output "app_hostname" {
  value = azurerm_linux_web_app.metabase.default_hostname
}

# TODO: azure upgrade remove
# output "azurerm_app_service_metabase_id" {
#   value = azurerm_linux_web_app.metabase.id
# }

output "azurerm_linux_web_app_metabase_id" {
  value = azurerm_linux_web_app.metabase.id
}