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

# TODO: azurerm upgrade remove
# resource "azurerm_app_service" "metabase" {

#   name                = var.name
#   resource_group_name = var.resource_group_name
#   location            = var.resource_group_location
#   app_service_plan_id = var.service_plan_id
#   https_only          = true

#   site_config {
#     always_on        = true
#     linux_fx_version = "DOCKER|metabase/metabase:v0.44.4"
#     ftps_state       = "Disabled"
#   }

#   app_settings = merge(local.app_setting_defaults, {
#     "MB_DB_USER" = var.postgres_metabase_username,
#     "MB_DB_PASS" = var.postgres_metabase_password
#   })

#   identity {
#     type = "SystemAssigned"
#   }

#   logs {
#     http_logs {
#       file_system {
#         retention_in_days = 7
#         retention_in_mb   = 30
#       }
#     }
#   }
#   lifecycle {
#     ignore_changes = all
#   }
# }

resource "azurerm_linux_web_app" "metabase" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.resource_group_location
  service_plan_id     = var.service_plan_id
  https_only          = true
  # virtual_network_subnet_id = var.webapp_subnet_id
  
  site_config {
    always_on = true
    ftps_state = "Disabled"
    scm_minimum_tls_version = "1.0"
    use_32_bit_worker = false
    vnet_route_all_enabled = false
    
    ip_restriction {
      virtual_network_subnet_id = var.lb_subnet_id
      action                    = "Allow"
    }
  }

  app_settings = merge(local.app_setting_defaults, {
    docker_image = "DOCKER|metabase/metabase",
    docker_image_tag = "v0.44.4",
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
  object_id    = azurerm_linux_web_app.metabase.identity[0].principal_id
  tenant_id    = var.tenant_id

  key_permissions = [
    "Get",
    "List",
  ]
  secret_permissions = [
    "Get",
    "List",
  ]
  depends_on = [azurerm_linux_web_app.metabase]
}

resource "azurerm_app_service_virtual_network_swift_connection" "metabase_vnet_integration" {
  app_service_id = azurerm_linux_web_app.metabase.id
  subnet_id      = var.webapp_subnet_id
}
