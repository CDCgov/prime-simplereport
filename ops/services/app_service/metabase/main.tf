locals {
  app_setting_defaults = {
    "MB_DB_CONNECTION_URI"           = var.postgres_url
    "WEBSITE_VNET_ROUTE_ALL"         = 1
    "WEBSITE_DNS_SERVER"             = "168.63.129.16"
    "APPINSIGHTS_INSTRUMENTATIONKEY" = var.ai_instrumentation_key
  }

  schema_name = "public"

  grant_command = <<EOF
  psql \
  --host ${var.postgres_server_name} \
  --port ${var.postgres_port} \
  --username ${var.administrator_login} \
  --dbname "${var.postgres_db_name}" \
  --command "
    REVOKE ALL PRIVILEGES ON SCHEMA public FROM PUBLIC;
    CREATE ROLE ${data.azurerm_key_vault_secret.postgres_nophi_user.value} with LOGIN ENCRYPTED PASSWORD
    '${data.azurerm_key_vault_secret.postgres_nophi_pass.value}';
    GRANT USAGE ON SCHEMA ${local.schema_name} TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
    GRANT SELECT ON TABLE facility_device_type TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
    GRANT SELECT ON TABLE device_type TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
    GRANT SELECT ON TABLE organization TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
    GRANT SELECT ON TABLE patient_answers TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
    GRANT SELECT ON TABLE facility TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
    GRANT SELECT ON TABLE patient_link TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
    GRANT SELECT ON TABLE data_hub_upload TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
    GRANT SELECT ON TABLE time_of_consent TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
    GRANT SELECT ON TABLE specimen_type TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
    GRANT SELECT ON TABLE device_specimen_type TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
    GRANT SELECT ON TABLE facility_device_specimen_type TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
    GRANT SELECT ON TABLE test_order TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};

    GRANT SELECT (internal_id, created_at, updated_at, last_seen, is_deleted) ON TABLE api_user
    TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
    
    GRANT SELECT (internal_id, created_at, created_by, updated_at, updated_by, is_deleted, provider_id)
    ON TABLE provider TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
                
    GRANT SELECT (internal_id, created_at, created_by, updated_at, updated_by, is_deleted, organization_id, employed_in_healthcare,
    resident_congregate_setting, facility_id, race, gender, ethnicity, lookup_id, role)
    ON TABLE person TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
                
    GRANT SELECT (device_specimen_type_id, created_at, created_by, updated_at, updated_by, patient_id, organization_id, 
    device_type_id, result, facility_id, survey_data, date_tested_backdate, test_order_id, correction_status, 
    prior_corrected_test_event_id, internal_id, reason_for_correction)
    ON TABLE test_event TO ${data.azurerm_key_vault_secret.postgres_nophi_user.value};
  "
  EOF
}

variable "app_settings_overrides" {
  description = "override values for app_settings"
  default     = {}
}

resource "null_resource" "add_nophi_db_user" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command    = var.run_nophi_user_create == false ? "echo" : local.grant_command
    on_failure = continue
  }

  depends_on = [
    data.azurerm_key_vault_secret.postgres_nophi_user,
    data.azurerm_key_vault_secret.postgres_nophi_pass
  ]
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
    azurerm_postgresql_database.metabase,
    null_resource.add_nophi_db_user
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
