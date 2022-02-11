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

resource "azurerm_monitor_metric_alert" "http_response_time" {
  name                = "${var.env}-api-http-response"
  description         = "${local.env_title} network response >= 1000ms(1s)"
  resource_group_name = var.rg_name
  scopes              = [var.app_service_id]
  frequency           = "PT1M"
  window_size         = "PT15M"
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
  description         = "${local.env_title} HTTP Server 2xx Errors (where successful request == false) >= 25"
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
| where toint(resultCode) between (200 .. 299) and success == false and timestamp >= ago(5m)
  QUERY

  trigger {
    operator  = "GreaterThan"
    threshold = var.failed_http_2xx_threshold
  }

  action {
    action_group = var.action_group_ids
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "http_4xx_errors" {
  name                = "${var.env}-api-4xx-errors"
  description         = "${local.env_title} HTTP Server 4xx Errors (excluding 401s and 410s) >= 25"
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
    and (set_has_element(dynamic([401, 410]), toint(resultCode)) == false)
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
    threshold = 24
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

resource "azurerm_monitor_scheduled_query_rules_alert" "db_query_duration" {
  name                = "${var.env}-db-query-duration"
  description         = "${local.env_title} DB query durations >= 10s"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = var.severity
  frequency           = 5
  time_window         = 5
  enabled             = contains(var.disabled_alerts, "db_query_duration") ? false : true

  data_source_id = var.app_insights_id

  query = <<-QUERY
dependencies
${local.skip_on_weekends}
| where timestamp >= ago(5m) and name has "SQL:" and duration >= 10000
  QUERY

  trigger {
    operator  = "GreaterThan"
    threshold = 0
  }

  action {
    action_group = var.action_group_ids
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "db_query_duration_over_time_window" {
  name                = "${var.env}-db-query-duration-over-time-window"
  description         = "10+ DB queries with durations over 1.25s in the past 5 minutes"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = var.severity
  frequency           = 5
  time_window         = 5
  enabled             = contains(var.disabled_alerts, "db_query_duration_over_time_window") ? false : true

  data_source_id = var.app_insights_id

  query = <<-QUERY
dependencies
${local.skip_on_weekends}
| where timestamp >= ago(5m) and name startswith "SQL:" and duration > 1250 and data !startswith "insert into public.api_audit_event"
  QUERY

  trigger {
    operator  = "GreaterThan"
    threshold = 25
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
  time_window         = 7
  enabled             = contains(var.disabled_alerts, "batched_uploader_single_failure_detected") ? false : true

  data_source_id = var.app_insights_id

  query = <<-QUERY
requests
${local.skip_on_weekends}
| where timestamp >= ago(7m) 
    and operation_Name =~ 'QueueBatchedReportStreamUploader' 
    and success != true
  QUERY

  trigger {
    operator  = "GreaterThan"
    threshold = 0
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
