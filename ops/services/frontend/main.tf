locals {
  is_prod       = var.env == "prod"
  custom_domain = local.is_prod ? var.domain_name : "${var.env}.${var.domain_name}"
}

// Frontend code
resource "azurerm_storage_account" "frontend" {
  account_replication_type  = "GRS"
  account_tier              = "Standard"
  account_kind              = "StorageV2"
  location                  = var.rg_location
  name                      = "simplereport${var.env}frontend"
  resource_group_name       = var.rg_name
  enable_https_traffic_only = true
  min_tls_version           = TLS1_2

  custom_domain {
    name = local.custom_domain
  }

  static_website {
    index_document = "index.html"
  }
  tags = var.tags
}
