locals {
  app_setting_defaults = {
    "MB_DB_CONNECTION_URI"           = var.postgres_url
    "WEBSITE_VNET_ROUTE_ALL"         = 1
    "WEBSITE_DNS_SERVER"             = "168.63.129.16"
    "APPINSIGHTS_INSTRUMENTATIONKEY" = var.ai_instrumentation_key
  }
}

resource "azurerm_app_service" "metabase" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.resource_group_location
  app_service_plan_id = var.app_service_plan_id
  https_only          = true

  site_config {
    always_on        = true
    linux_fx_version = "DOCKER|metabase/metabase"
  }

  app_settings = merge(local.app_setting_defaults, var.app_settings_overrides)

  identity {
    type = "SystemAssigned"
  }

  logs {
    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 30
      }
    }
  }
  depends_on = [
    azurerm_postgresql_database.metabase
  ]
}

resource "azurerm_key_vault_access_policy" "app_secret_access" {
  key_vault_id = var.key_vault_id
  object_id    = azurerm_app_service.metabase.identity[0].principal_id
  tenant_id    = var.tenant_id

  key_permissions = [
    "get",
    "list",
  ]
  secret_permissions = [
    "get",
    "list",
  ]
  depends_on = [azurerm_app_service.metabase]
}

resource "azurerm_app_service_virtual_network_swift_connection" "metabase_vnet_integration" {
  app_service_id = azurerm_app_service.metabase.id
  subnet_id      = var.webapp_subnet_id
}

resource "azurerm_postgresql_database" "metabase" {
  charset             = "UTF8"
  collation           = "English_United States.1252"
  name                = "metabase"
  resource_group_name = var.resource_group_name
  server_name         = var.postgres_server_name
}
