resource "azurerm_monitor_metric_alert" "db_storage" {
  name                = "${var.env}-db-storage"
  description         = "${title(var.env)} storage utilization is greater than ${var.db_storage_threshold}%"
  resource_group_name = var.rg_name
  scopes              = [var.db_id]
  frequency           = "PT5M"
  window_size         = "PT15M"
  enabled             = false
  severity            = 2 // Warning, since 80% should be enough warning to make this non-critical

  criteria {
    aggregation      = "Average"
    metric_name      = "storage_percent"
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    operator         = "GreaterThan"
    threshold        = var.db_storage_threshold
  }

  dynamic "action" {
    for_each = var.action_group_ids
    content {
      action_group_id    = action.value
      webhook_properties = var.wiki_docs_json
    }
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}
