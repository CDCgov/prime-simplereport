// Frontend code
resource "azurerm_storage_account" "frontend" {
  account_replication_type = "GRS"
  account_tier = "Standard"
  account_kind = "StorageV2"
  location = var.rg_location
  name = "simplereport${var.env}frontend"
  resource_group_name = var.rg_name
  enable_https_traffic_only = false

  static_website {
    index_document = "index.html"
  }
  tags = var.tags
}
