# Steps:
# X. Create a connection to the database (or use the existing connection, if possible) under the administrative login
# X. Add a new readonly role using the postgres_role and postgres_grant functions
# 3. Add a new Metabase connection (hopefully more sensibly, with DB_USER and DB_PASS)

# Need to: 
# X add a var file to store the server_name and login information
# X add a data file/vault file to store the secret password
# - Create a readonly role using Azure (since postgresql_grant doesn't allow for column-level permissions)
# - Store all the required secrets in Azure (username, password, port, host)

# Notes/Suspicions/Etc
# - Given the existing setup, I suspect (but can't confirm) that the /ops/services/database is used to manage the app connection to the database, 
#       while ops/services/postgres_db is used to create the db in Azure
# - It's not possible to create/manage the readonly user within terraform, because the postgres_grant action only supports granting table-level
#   permissions and we need column-level permissions to protect PII.
#   (terraform contributor is working to add this feature, but it's not in production yet: https://github.com/cyrilgdn/terraform-provider-postgresql/issues/23)
# - As a result, we need to create the role and manage the permissions manually in Azure.
# - MB_GOOGLE_AUTH_AUTO_CREATE_ACCOUNTS_DOMAIN could be useful for configuring authentication - just give the permission to anyone with a 
#   CDC email address. 



# Connect to the database
# I'm not actually sure it's necessary to do this at all - we can't do anything with
# the administrative login, since there's no way to secure the proper permissions in TF
/*
provider "postgresql" {
  host = var.postgres_server_name
  port = 5432
  database = "simple_report"
  username = var.administrator_login
  #probably need to somehow connect this to the db_password in postgres_db/data
  password = data.azurerm_key_vault_secret.db_password.value
}
*/

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

# Need to look into all of this further - what is it doing and why is it here?
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