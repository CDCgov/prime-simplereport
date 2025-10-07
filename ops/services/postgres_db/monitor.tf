resource "azurerm_monitor_diagnostic_setting" "postgres" {
  name                       = "simple-report-${var.env}-db-diag"
  target_resource_id         = azurerm_postgresql_flexible_server.db.id
  log_analytics_workspace_id = var.log_workspace_id

  enabled_log {
    category = "PostgreSQLLogs"

    retention_policy {
      enabled = false
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = false
    }
  }
}

