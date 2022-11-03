locals {
  env_title = title(var.env)

  // If skip_on_weekends true, only run the query on weekdays
  skip_on_weekends = var.skip_on_weekends ? "| where dayofweek(now()) between (time(1) .. time(5))" : "| where true"
}

resource "azurerm_monitor_metric_alert" "cpu_util" {
  name                = "${var.env}-api-cpu"
  description         = "${local.env_title} CPU utilization is greater than ${var.cpu_threshold}%"
  resource_group_name = var.rg_name
  scopes              = [var.app_service_plan_id]
  frequency           = "PT15M"
  window_size         = var.cpu_window_size
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

resource "azurerm_monitor_smart_detector_alert_rule" "failure_anomalies" {
  name                = "${var.env}-failure-anomalies"
  description         = "${local.env_title} Failure Anomalies notifies you of an unusual rise in the rate of failed HTTP requests or dependency calls."
  resource_group_name = var.rg_name
  severity            = "Sev1"
  scope_resource_ids  = [var.app_insights_id]
  frequency           = "PT1M"
  detector_type       = "FailureAnomaliesDetector"

  action_group {
    ids = var.action_group_ids
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "http_2xx_failed_requests" {
  name                = "${var.env}-api-2xx-failed-requests"
  description         = "${local.env_title} HTTP Server 2xx (requests where (failed requests * 100.00 / total requests) >= ${var.http_2xx_failure_rate_threshold}). This query finds all requests in our timeframe and transforms the failed requests into a percentage of total requests."
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = var.severity
  frequency           = 5
  time_window         = 5
  enabled             = contains(var.disabled_alerts, "http_2xx_failed_requests") ? false : true

  data_source_id = var.app_insights_id

  query = <<-QUERY
requests
${local.skip_on_weekends}
| where toint(resultCode) between (200 .. 299) and timestamp >= ago(5m)
| sort by timestamp asc
| summarize alert = iff((todouble(sumif(1, success == false)) * 100 / todouble(count()) >= ${var.http_2xx_failure_rate_threshold}), 1, 0)
| where alert == 1
  QUERY

  trigger {
    operator  = "GreaterThan"
    threshold = 0
  }

  action {
    action_group = var.action_group_ids
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "http_4xx_errors" {
  name                = "${var.env}-api-4xx-errors"
  description         = "${local.env_title} HTTP Server 4xx Errors (excluding 401s, 403s, and 410s) >= 50"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = var.severity
  frequency           = 5
  time_window         = 5
  enabled             = contains(var.disabled_alerts, "http_4xx_errors") ? false : true

  data_source_id = var.app_insights_id

  query = <<-QUERY
requests
${local.skip_on_weekends}
| where toint(resultCode) >= 400
    and toint(resultCode) < 500
    and (set_has_element(dynamic([401, 403, 410]), toint(resultCode)) == false)
    and timestamp >= ago(5m)
| join kind= leftsemi (
    exceptions
    | where timestamp >= ago(5m)
        and (type has_any (dynamic(["BadRequestException", "InvalidActivationLinkException"]))) == false
        and (outerMessage has_any (dynamic(["Missing session attribute 'userId'"]))) == false
    )
    on operation_Id
  QUERY

  trigger {
    operator  = "GreaterThan"
    threshold = 49
  }

  action {
    action_group = var.action_group_ids
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "http_401_410" {
  name                = "${var.env}-api-401-410-errors"
  description         = "${local.env_title} HTTP Server 401/410 Errors >= 500"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = var.severity
  frequency           = 5
  time_window         = 5
  enabled             = contains(var.disabled_alerts, "http_401_410_errors") ? false : true

  data_source_id = var.app_insights_id

  query = <<-QUERY
requests
${local.skip_on_weekends}
| where toint(resultCode) == 401 or toint(resultCode) == 410 and timestamp >= ago(5m)
  QUERY

  trigger {
    operator  = "GreaterThan"
    threshold = 499
  }

  action {
    action_group = var.action_group_ids
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "http_5xx_errors" {
  name                = "${var.env}-api-5xx-errors"
  description         = "${local.env_title} HTTP Server 5xx Errors >= 10"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = var.severity
  frequency           = 5
  time_window         = 5
  enabled             = contains(var.disabled_alerts, "http_5xx_errors") ? false : true

  data_source_id = var.app_insights_id

  query = <<-QUERY
requests
${local.skip_on_weekends}
| where toint(resultCode) >= 500 and timestamp >= ago(5m)
  QUERY

  trigger {
    operator  = "GreaterThan"
    threshold = 9
  }

  action {
    action_group = var.action_group_ids
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "batched_uploader_single_failure_detected" {
  name                = "${var.env}-batched-uploader-single-failure-detected"
  description         = "QueueBatchedReportStreamUploader failed to successfully complete"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = var.severity
  frequency           = 5
  time_window         = 11
  enabled             = contains(var.disabled_alerts, "batched_uploader_single_failure_detected") ? false : true

  data_source_id = var.app_insights_id

  query = <<-QUERY
requests
${local.skip_on_weekends}
| where timestamp >= ago(11m) 
    and operation_Name =~ 'QueueBatchedReportStreamUploader' 
    and success != true
  QUERY

  trigger {
    operator  = "GreaterThan"
    threshold = 4
  }

  action {
    action_group = var.action_group_ids
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "batched_uploader_function_not_triggering" {
  name                = "${var.env}-batched-uploader-function-not-triggering"
  description         = "QueueBatchedReportStreamUploader is not triggering on schedule"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = var.severity
  frequency           = 5
  time_window         = 7
  enabled             = contains(var.disabled_alerts, "batched_uploader_function_not_triggering") ? false : true

  data_source_id = var.app_insights_id

  query = <<-QUERY
requests
${local.skip_on_weekends}
| where timestamp >= ago(7m) 
    and operation_Name =~ 'QueueBatchedReportStreamUploader'
  QUERY

  trigger {
    operator  = "Equal"
    threshold = 0
  }

  action {
    action_group = var.action_group_ids
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "bulk_results_upload" {
  name                = "${var.env}-bulk_results_upload"
  description         = "${local.env_title} alert when bulk uploads fail"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name

  action {
    action_group = var.action_group_ids
  }

  data_source_id = var.app_insights_id
  enabled        = contains(var.disabled_alerts, "bulk_results_upload") ? false : true

  query = <<-QUERY
requests
| where true
| where timestamp >= ago(6m)
    and name == "/upload/results"
    and toint(resultCode) >= 500
  QUERY

  severity    = 1
  frequency   = 5
  time_window = 6
  trigger {
    operator  = "GreaterThan"
    threshold = 0
  }
}
