locals {
  diag_db_logs = [
    "PostgreSQLLogs"
  ]

  diag_db_metrics = [
    "AllMetrics"
  ]
}

resource "azurerm_key_vault_secret" "db_password" {
  key_vault_id = var.key_vault_id
  name         = "simple-report-${var.env}-db-password"
  value        = random_password.random_db_password.result
}

resource "random_password" "random_db_password" {
  length           = 30
  special          = false
  override_special = "!#$%&*()-_=+[]{}<>:?"

  # Rotated when the master_password_rotated value changes
  keepers = {
    last_rotated = var.master_password_rotated
  }
}

resource "azurerm_postgresql_server" "db" {
  name                          = "simple-report-${var.env}-db"
  location                      = var.rg_location
  resource_group_name           = var.rg_name
  sku_name                      = "GP_Gen5_4"
  version                       = "11"
  ssl_enforcement_enabled       = false
  administrator_login           = "simple_report_app"
  administrator_login_password  = azurerm_key_vault_secret.db_password.value
  public_network_access_enabled = true

  storage_mb                   = 102400
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled            = true

  tags = var.tags

  lifecycle {
    ignore_changes = [
      identity
    ]
  }
}

resource "azurerm_postgresql_database" "simple_report" {
  charset             = "UTF8"
  collation           = "English_United States.1252"
  name                = "simple_report"
  resource_group_name = var.rg_name
  server_name         = azurerm_postgresql_server.db.name
}

# These parameters and names need to be exact: https://github.com/MicrosoftDocs/azure-docs/issues/20758
# It looks like this only works if we enable public access. Otherwise, we need to use virtual network rules.
//resource "azurerm_postgresql_firewall_rule" "all" {
//  name = "AllowAllAzureIps"
//  resource_group_name = var.rg_name
//  server_name = azurerm_postgresql_server.db.name
//  start_ip_address = "0.0.0.0"
//  end_ip_address = "0.0.0.0"
//}

resource "azurerm_monitor_diagnostic_setting" "backend-db" {
  name                       = "simple-report-${var.env}-db-diag"
  target_resource_id         = azurerm_postgresql_server.db.id
  log_analytics_workspace_id = var.log_workspace_id

  dynamic "log" {
    for_each = local.diag_db_logs
    content {
      category = log.value

      retention_policy {
        enabled = false
      }
    }
  }

  dynamic "metric" {
    for_each = local.diag_db_metrics
    content {
      category = metric.value

      retention_policy {
        enabled = false
      }
    }
  }
}
