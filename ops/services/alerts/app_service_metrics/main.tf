locals {
  env_title = title(var.env)
}

resource "azurerm_monitor_metric_alert" "cpu_util" {
  name                = "${var.env}-api-cpu"
  description         = "${local.env_title} CPU utilization is greater than ${var.cpu_threshold}%"
  resource_group_name = var.rg_name
  scopes              = [var.app_service_plan_id]
  frequency           = "PT1M"
  window_size         = "PT${var.cpu_window_size}M"
  enabled             = contains(var.disabled_alerts, "cpu_util") ? false : true

  criteria {
    aggregation      = "Average"
    metric_name      = "CpuPercentage"
    metric_namespace = "Microsoft.Web/serverfarms"
    operator         = "GreaterThanOrEqual"
    threshold        = var.cpu_threshold
  }

  dynamic "action" {
    for_each = var.action_group_ids
    content {
      action_group_id = action.value
    }
  }
}

resource "azurerm_monitor_metric_alert" "mem_util" {
  name                = "${var.env}-api-mem"
  description         = "${local.env_title} memory utilization is greater than ${var.mem_threshold}%"
  resource_group_name = var.rg_name
  scopes              = [var.app_service_plan_id]
  frequency           = "PT1M"
  window_size         = "PT5M"
  severity            = var.severity
  enabled             = contains(var.disabled_alerts, "mem_util") ? false : true

  criteria {
    aggregation      = "Average"
    metric_name      = "MemoryPercentage"
    metric_namespace = "Microsoft.Web/serverfarms"
    operator         = "GreaterThanOrEqual"
    threshold        = var.mem_threshold
  }

  dynamic "action" {
    for_each = var.action_group_ids
    content {
      action_group_id = action.value
    }
  }
}

resource "azurerm_monitor_metric_alert" "http_response_time" {
  name                = "${var.env}-api-http-response"
  description         = "${local.env_title} network response >= 1000ms(1s)"
  resource_group_name = var.rg_name
  scopes              = [var.app_service_id]
  frequency           = "PT1M"
  window_size         = "PT5M"
  severity            = var.severity
  enabled             = contains(var.disabled_alerts, "http_response_time") ? false : true

  criteria {
    aggregation      = var.http_response_time_aggregation
    metric_name      = "HttpResponseTime"
    metric_namespace = "Microsoft.Web/sites"
    operator         = "GreaterThanOrEqual"
    threshold        = 1.000 #(1s/1000ms)
  }

  dynamic "action" {
    for_each = var.action_group_ids
    content {
      action_group_id = action.value
    }
  }
}


resource "azurerm_monitor_metric_alert" "http_5xx_errors" {
  name                = "${var.env}-api-5xx-errors"
  description         = "${local.env_title} HTTP Server 5xx Errors >= 10"
  resource_group_name = var.rg_name
  scopes              = [var.app_service_id]
  frequency           = "PT1M"
  window_size         = "PT5M"
  severity            = var.severity
  enabled             = contains(var.disabled_alerts, "http_5xx_errors") ? false : true

  criteria {
    aggregation      = "Average"
    metric_name      = "Http5xx"
    metric_namespace = "Microsoft.Web/sites"
    operator         = "GreaterThanOrEqual"
    threshold        = 10
  }

  dynamic "action" {
    for_each = var.action_group_ids
    content {
      action_group_id = action.value
    }
  }
}

resource "azurerm_monitor_metric_alert" "http_4xx_errors" {
  name                = "${var.env}-api-4xx-errors"
  description         = "${local.env_title} HTTP Server 4xx Errors >= 10"
  resource_group_name = var.rg_name
  scopes              = [var.app_service_id]
  frequency           = "PT1M"
  window_size         = "PT5M"
  severity            = var.severity
  enabled             = contains(var.disabled_alerts, "http_4xx_errors") ? false : true

  criteria {
    aggregation      = "Average"
    metric_name      = "Http4xx"
    metric_namespace = "Microsoft.Web/sites"
    operator         = "GreaterThanOrEqual"
    threshold        = 10
  }

  dynamic "action" {
    for_each = var.action_group_ids
    content {
      action_group_id = action.value
    }
  }
}
