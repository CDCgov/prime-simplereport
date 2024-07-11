locals {
  app_setting_defaults = {
    "MB_DB_USER"                                      = var.postgres_metabase_username
    "MB_DB_PASS"                                      = var.postgres_metabase_password
    "MB_DB_CONNECTION_URI"                            = var.postgres_url
    "MB_APPLICATION_DB_MAX_CONNECTION_POOL_SIZE"      = 4 # Controls internal Metabase connection pool sizing
    "MB_JDBC_DATA_WAREHOUSE_MAX_CONNECTION_POOL_SIZE" = 4 # Controls connection pool sizing to existing data sources (such as postgres)
    "WEBSITE_DNS_SERVER"                              = "168.63.129.16"
    "APPINSIGHTS_INSTRUMENTATIONKEY"                  = var.ai_instrumentation_key
    "MB_SITE_URL"                                     = var.metabase_url
  }
}

# Create a null_resource to store the service plan ID in state. This is needed
# to pass the service plan ID to the service instance.
resource "null_resource" "service_plan_id" {
  # Use the service_plan_id variable as a trigger for the null_resource. This
  # will cause the null_resource to update whenever the service_plan_id
  # variable is updated. This is rare but is needed because the metabase service 
  # instance is dependent on our service plan.
  triggers = {
    service_plan_id = var.service_plan_id
  }
}

resource "azurerm_linux_web_app" "metabase" {
  name                      = var.name
  resource_group_name       = var.resource_group_name
  location                  = var.resource_group_location
  service_plan_id           = var.service_plan_id
  https_only                = true
  virtual_network_subnet_id = var.webapp_subnet_id

  site_config {
    always_on                         = true
    health_check_path                 = "/api/health"
    health_check_eviction_time_in_min = 5
    ftps_state                        = "Disabled"
    scm_minimum_tls_version           = "1.2"
    use_32_bit_worker                 = false
    vnet_route_all_enabled            = false
    ip_restriction_default_action     = "Deny" # Should use behavior set in the ip_restriction
    scm_ip_restriction_default_action = "Deny" # We don't use Kudu or the SCM site tools

    ip_restriction {
      virtual_network_subnet_id = var.lb_subnet_id
      action                    = "Allow"
    }

    application_stack {
      docker_image     = "metabase/metabase"
      docker_image_tag = "v0.50.10"
    }
  }

  app_settings = local.app_setting_defaults

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
  lifecycle {
    ignore_changes = [
      tags
    ]
    replace_triggered_by = [
      null_resource.service_plan_id
    ]
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
