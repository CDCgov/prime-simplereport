# Initializing a new readonly user and granting them the proper permissions has to be done via 
# psql, because the postgres terraform library does not allow granting column-level 
# restrictions on roles.

locals {
  grant_command = <<EOF
  psql \
  --host ${var.postgres_server_name} \
  --port ${var.postgres_port} \
  --username ${var.administrator_login} \
  --dbname "${var.postgres_db_name}" \
  --command "
    CREATE ROLE ${var.postgres_readonly_user} with LOGIN ENCRYPTED PASSWORD
    '${var.postgres_readonly_pass}';
    GRANT USAGE ON SCHEMA public TO ${var.postgres_readonly_user};
    GRANT SELECT ON TABLE facility_device_type TO ${var.postgres_readonly_user};
    GRANT SELECT ON TABLE device_type TO ${var.postgres_readonly_user};
    GRANT SELECT ON TABLE organization TO ${var.postgres_readonly_user};
    GRANT SELECT ON TABLE patient_answers TO ${var.postgres_readonly_user};
    GRANT SELECT ON TABLE facility TO ${var.postgres_readonly_user};
    GRANT SELECT ON TABLE patient_link TO ${var.postgres_readonly_user};
    GRANT SELECT ON TABLE data_hub_upload TO ${var.postgres_readonly_user};
    GRANT SELECT ON TABLE time_of_consent TO ${var.postgres_readonly_user};
    GRANT SELECT ON TABLE specimen_type TO ${var.postgres_readonly_user};
    GRANT SELECT ON TABLE device_specimen_type TO ${var.postgres_readonly_user};
    GRANT SELECT ON TABLE facility_device_specimen_type TO ${var.postgres_readonly_user};
    GRANT SELECT ON TABLE test_order TO ${var.postgres_readonly_user};

    GRANT SELECT (internal_id, created_at, updated_at, last_seen, is_deleted) ON TABLE api_user
    TO ${var.postgres_readonly_user};
    
    GRANT SELECT (internal_id, created_at, created_by, updated_at, updated_by, is_deleted, provider_id)
    ON TABLE provider TO ${var.postgres_readonly_user};
                
    GRANT SELECT (internal_id, created_at, created_by, updated_at, updated_by, is_deleted, organization_id, employed_in_healthcare,
    resident_congregate_setting, facility_id, race, gender, ethnicity, lookup_id, role)
    ON TABLE person TO ${var.postgres_readonly_user};
                
    GRANT SELECT (device_specimen_type_id, created_at, created_by, updated_at, updated_by, patient_id, organization_id, 
    device_type_id, result, facility_id, survey_data, date_tested_backdate, test_order_id, correction_status, 
    prior_corrected_test_event_id, internal_id, reason_for_correction)
    ON TABLE test_event TO ${var.postgres_readonly_user};
  "
  EOF
}

resource "null_resource" "add_readonly_db_user" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command    = var.run_readonly_user_create == false ? "echo" : locals.grant_command
    on_failure = continue
    # Commented this out for now since password is coming from the Vault, 
    # but that might not be correct
    # environment = {
    #   PGPASSWORD = module.db_secrets.password
    # }
  }

  depends_on = [
    azurerm_key_vault_secret.postgres_readonly_user
    # it should really depend on the password, but I'm not sure if it's possible
    # to depend on data instead of a resource
  ]
}

resource "azurerm_app_service" "metabase-readonly" {
    name = var.name
    resource_group_name = var.resource_group_name
    location = var.resource_group_location
    app_service_plan_id = var.app_service_plan_id
    https_only = true
    site_config {
        always_on = true
        linux_fx_version = "DOCKER|metabase/metabase-readonly"
    }

    app_settings = {
        "MB_DB_USER"                     = var.postgres_readonly_user
        "MB_DB_PASS"                     = var.postgres_readonly_pass
        "MB_DB_NAME"                     = var.postgres_db_name
        "MB_DB_TYPE"                     = "postgres"
        "MB_DB_HOST"                     = var.postgres_server_name
        "MB_DB_PORT"                     = var.postgres_port
        "WEBSITE_VNET_ROUTE_ALL"         = 1
        "WEBSITE_DNS_SERVER"             = "168.63.129.16"
        "APPINSIGHTS_INSTRUMENTATIONKEY" = var.ai_instrumentation_key
     }

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
  depends_on = [azurerm_postgresql_database.metabase-readonly]
}


resource "azurerm_key_vault_access_policy" "app_secret_access" {
  key_vault_id = var.key_vault_id
  object_id    = azurerm_app_service.metabase-readonly.identity[0].principal_id
  tenant_id    = var.tenant_id

  key_permissions = [
    "get",
    "list",
  ]
  secret_permissions = [
    "get",
    "list",
  ]
  depends_on = [azurerm_app_service.metabase-readonly]
}

resource "azurerm_app_service_virtual_network_swift_connection" "metabase_readonly_vnet_integration" {
  app_service_id = azurerm_app_service.metabase-readonly.id
  subnet_id      = var.webapp_subnet_id
}

resource "azurerm_postgresql_database" "metabase-readonly" {
  charset             = "UTF8"
  collation           = "English_United States.1252"
  name                = "metabase-readonly"
  resource_group_name = var.resource_group_name
  server_name         = var.postgres_server_name
}