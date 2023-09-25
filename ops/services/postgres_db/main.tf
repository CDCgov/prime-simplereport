resource "azurerm_postgresql_flexible_server" "db" {
  name                = "simple-report-${var.env}-flexible-db"
  location            = var.rg_location
  resource_group_name = var.rg_name
  sku_name            = var.env == "prod" ? "MO_Standard_E8ds_v4" : "MO_Standard_E4ds_v4"
  version             = "14"
  delegated_subnet_id = var.subnet_id
  private_dns_zone_id = var.private_dns_zone_id


  administrator_login    = var.administrator_login
  administrator_password = azurerm_key_vault_secret.db_password.value

  storage_mb                   = 524288 // 512 GB
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false

  tags = var.tags

  # Time is Eastern
  maintenance_window {
    day_of_week  = 0
    start_hour   = 0
    start_minute = 0
  }

  # Only activate high availability in production for now.
  dynamic "high_availability" {
    for_each = var.env == "prod" ? [1] : []
    content {
      mode                      = "ZoneRedundant"
      standby_availability_zone = 2
    }
  }

  # See note at https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/postgresql_flexible_server#high_availability
  lifecycle {
    ignore_changes = [
      zone,
      high_availability.0.standby_availability_zone,
      tags,
      administrator_password
    ]
  }
}

resource "azurerm_postgresql_flexible_server_database" "simple_report" {
  charset   = "UTF8"
  collation = "en_US.utf8"
  name      = var.db_table
  server_id = azurerm_postgresql_flexible_server.db.id
}

resource "azurerm_postgresql_flexible_server_configuration" "log_autovacuum_min_duration" {
  name      = "log_autovacuum_min_duration"
  server_id = azurerm_postgresql_flexible_server.db.id
  value     = 250
}

resource "azurerm_postgresql_flexible_server_configuration" "pg_qs_query_capture_mode" {
  name      = "pg_qs.query_capture_mode"
  server_id = azurerm_postgresql_flexible_server.db.id
  value     = "TOP"
}

resource "azurerm_postgresql_flexible_server_configuration" "pgms_wait_sampling_query_capture_mode" {
  name      = "pgms_wait_sampling.query_capture_mode"
  server_id = azurerm_postgresql_flexible_server.db.id
  value     = "ALL"
}

resource "azurerm_postgresql_flexible_server_configuration" "postgresql_shared_preload_libraries" {
  name      = "shared_preload_libraries"
  server_id = azurerm_postgresql_flexible_server.db.id
  value     = "auto_explain,pg_cron,pg_stat_statements"
}

# This allows us to install these extensions on the server
resource "azurerm_postgresql_flexible_server_configuration" "postgresql_extensions" {
  name      = "azure.extensions"
  server_id = azurerm_postgresql_flexible_server.db.id
  value     = "PG_STAT_STATEMENTS,PGCRYPTO,PLPGSQL"
}
