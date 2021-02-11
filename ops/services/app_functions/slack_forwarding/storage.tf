# Create release package in the storage account
resource "azurerm_storage_container" "alerts" {
  name                  = "alert-manager-releases"
  storage_account_name  = var.storage_account
  container_access_type = "private"
}

resource "azurerm_storage_blob" "alertscode" {
  name                   = "alertscode.zip"
  storage_account_name   = var.storage_account
  storage_container_name = azurerm_storage_container.alerts.name
  type                   = "Block"
  source                 = local.function_code
}
