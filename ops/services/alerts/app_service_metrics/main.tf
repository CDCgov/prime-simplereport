resource "azurerm_monitor_metric_alert" "cpu_util" {
  name                = "${var.env}-api-cpu"
  description         = "CPU utilization is greater than 70%"
  resource_group_name = var.rg_name
  scopes              = [var.app_service_plan_id]
  frequency           = "PT1M"
  window_size         = "PT5M"
  enabled             = var.enabled

  criteria {
    aggregation      = "Average"
    metric_name      = "CpuPercentage"
    metric_namespace = "Microsoft.Web/serverfarms"
    operator         = "GreaterThanOrEqual"
    threshold        = 70
  }

  action {
    action_group_id = var.action_group_id
  }
}

resource "azurerm_monitor_metric_alert" "mem_util" {
  name                = "${var.env}-api-mem"
  description         = "Memory utilization is greater than 70%"
  resource_group_name = var.rg_name
  scopes              = [var.app_service_plan_id]
  frequency           = "PT1M"
  window_size         = "PT5M"
  severity            = var.severity
  enabled             = var.enabled

  criteria {
    aggregation      = "Average"
    metric_name      = "MemoryPercentage"
    metric_namespace = "Microsoft.Web/serverfarms"
    operator         = "GreaterThanOrEqual"
    threshold        = 70
  }

  action {
    action_group_id = var.action_group_id
  }
}