locals {
  app_setting_defaults = {
    "MB_DB_CONNECTION_URI"                            = var.postgres_url
    "MB_APPLICATION_DB_MAX_CONNECTION_POOL_SIZE"      = 4 # Controls internal Metabase connection pool sizing
    "MB_JDBC_DATA_WAREHOUSE_MAX_CONNECTION_POOL_SIZE" = 4 # Controls connection pool sizing to existing data sources (such as postgres)
    "WEBSITE_VNET_ROUTE_ALL"                          = 1
    "WEBSITE_DNS_SERVER"                              = "168.63.129.16"
    "APPINSIGHTS_INSTRUMENTATIONKEY"                  = var.ai_instrumentation_key
    "MB_SITE_URL"                                     = var.metabase_url
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
    linux_fx_version = "DOCKER|metabase/metabase:v0.44.4"
    ftps_state       = "Disabled"

    ip_restriction {
      virtual_network_subnet_id = var.lb_subnet_id
      action                    = "Allow"
    }
  }

  app_settings = merge(local.app_setting_defaults, {
    "MB_DB_USER" = var.postgres_metabase_username,
    "MB_DB_PASS" = var.postgres_metabase_password
  })

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
