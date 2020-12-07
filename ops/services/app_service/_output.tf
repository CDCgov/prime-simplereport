output "app_object_id" {
  value = azurerm_app_service.service.identity[0].principal_id
}