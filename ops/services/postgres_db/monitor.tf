resource "azurerm_monitor_diagnostic_setting" "postgres" {
  name                       = "simple-report-${var.env}-db-diag"
  target_resource_id         = azurerm_postgresql_server.db.id
  log_analytics_workspace_id = var.log_workspace_id

  log {
    category = "PostgreSQLLogs"
    enabled  = true

    retention_policy {
      days    = 0
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

  # These two log categories are no-ops and we don't use them, but not adding them here triggers constant
  # plan/apply changes due to a provider bug.
  # See: https://github.com/terraform-providers/terraform-provider-azurerm/issues/7235
  log {
    category = "QueryStoreRuntimeStatistics"
    enabled  = false

    retention_policy {
      days    = 0
      enabled = false
    }
  }

  log {
    category = "QueryStoreWaitStatistics"
    enabled  = false

    retention_policy {
      days    = 0
      enabled = false
    }
  }
}
