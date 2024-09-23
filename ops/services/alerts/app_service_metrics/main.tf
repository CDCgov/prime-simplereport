locals {
  env_title = title(var.env)

  // If skip_on_weekends true, only run the query on weekdays
  skip_on_weekends = var.skip_on_weekends ? "| where dayofweek(now()) between (time(1) .. time(5))" : "| where true"
}

resource "azurerm_monitor_metric_alert" "cpu_util" {
  name                = "${var.env}-api-cpu"
  description         = "${local.env_title} CPU utilization is greater than ${var.cpu_threshold}%"
  resource_group_name = var.rg_name
  scopes              = [var.service_plan_id]
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

resource "azurerm_monitor_metric_alert" "mem_util" {
  name                = "${var.env}-api-mem"
  description         = "${local.env_title} memory utilization is greater than ${var.mem_threshold}%"
  resource_group_name = var.rg_name
  scopes              = [var.service_plan_id]
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

resource "azurerm_monitor_smart_detector_alert_rule" "failure_anomalies" {
  name                = "${var.env}-failure-anomalies"
  description         = "${local.env_title} Failure Anomalies notifies you of an unusual rise in the rate of failed HTTP requests or dependency calls."
  resource_group_name = var.rg_name
  severity            = "Sev1"
  scope_resource_ids  = [var.app_insights_id]
  frequency           = "PT1M"
  detector_type       = "FailureAnomaliesDetector"

  action_group {
    ids             = var.action_group_ids
    webhook_payload = var.wiki_docs_text
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
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
| summarize alert = iff((todouble(sumif(1, success == false)) * 100 / todouble(count()) >= ${var.http_2xx_failure_rate_threshold} and sumif(1, success == false) > ${var.http_2xx_failed_threshold}), sumif(1, success == false), 0)
| where alert > 0
//
// You can use the following query to see all the requests that triggered this alert.
// These comments are ignored but the timestamp is updated correctly and should match the timestamp used in the above query.
//
// requests
// | where toint(resultCode) between (200 .. 299) and timestamp >= ago(5m) and success == false
// | sort by timestamp asc
  QUERY

  trigger {
    operator  = "GreaterThan"
    threshold = 0
  }

  action {
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
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
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
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
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
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
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
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
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "bulk_results_upload" {
  name                = "${var.env}-bulk_results_upload"
  description         = "${local.env_title} alert when bulk uploads fail"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name

  action {
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
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
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "report_stream_batched_uploader_400" {
  name                = "${var.env}-report_stream_batched_uploader_400"
  description         = "${local.env_title} alert when the batched uploader publish function results in a 400"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name

  action {
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }

  data_source_id = var.app_insights_id
  enabled        = contains(var.disabled_alerts, "report_stream_batched_uploader_400") ? false : true

  query = <<-QUERY
customEvents
| order by timestamp desc
| extend httpStatus = toint(customDimensions["status"])
| where httpStatus == 400 and name == "Queue: test-event-publishing. ReportStream Upload Failed"
  QUERY

  severity    = 1
  frequency   = 5
  time_window = 6
  trigger {
    operator  = "GreaterThan"
    threshold = 0
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "report_stream_fhir_batched_uploader_400" {
  name                = "${var.env}-report_stream_fhir_batched_uploader_400"
  description         = "${local.env_title} alert when the fhir batched uploader publish function results in a 400"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name

  action {
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }

  data_source_id = var.app_insights_id
  enabled        = contains(var.disabled_alerts, "report_stream_fhir_batched_uploader_400") ? false : true

  query = <<-QUERY
customEvents
| order by timestamp desc
| extend httpStatus = toint(customDimensions["status"])
| where httpStatus == 400 and name == "Queue: fhir-data-publishing. ReportStream Upload Failed"
  QUERY

  severity    = 1
  frequency   = 5
  time_window = 6
  trigger {
    operator  = "GreaterThan"
    threshold = 0
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "fhir_batched_uploader_single_failure_detected" {
  name                = "${var.env}-fhir-batched-uploader-single-failure-detected"
  description         = "FHIRTestEventReporter failed to successfully complete"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = var.severity
  frequency           = 5
  time_window         = 11
  enabled             = contains(var.disabled_alerts, "fhir_batched_uploader_single_failure_detected") ? false : true

  data_source_id = var.app_insights_id

  query = <<-QUERY
requests
${local.skip_on_weekends}
| where timestamp >= ago(11m) 
    and operation_Name =~ 'FHIRTestEventReporter' 
    and success != true
  QUERY

  trigger {
    operator  = "GreaterThan"
    threshold = 4
  }

  action {
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}

resource "azurerm_monitor_metric_alert" "function_app_memory_alert" {
  count               = var.function_id == null || contains(var.disabled_alerts, "function_app_memory_alert") ? 0 : 1
  enabled             = true
  name                = "${var.env}_function_app_batch_publisher_memory_alert"
  resource_group_name = var.rg_name
  scopes              = [var.function_id]
  description         = "Action will be triggered when memory usage is greater than 1200 mb, threshold is set in bytes"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "AverageMemoryWorkingSet"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = var.function_memory_threshold
  }

  dynamic "action" {
    for_each = var.action_group_ids
    content {
      action_group_id    = action.value
      webhook_properties = var.wiki_docs_json
    }
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "fhir_function_app_duration_alert" {
  name                = "${var.env}-fhir-function-app-batch-publisher-duration-alert"
  description         = "Action will be triggered when a single request is taking over 3 minutes"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = var.severity
  frequency           = 5
  time_window         = 7
  enabled             = contains(var.disabled_alerts, "fhir_function_app_duration_alert") ? false : true
  data_source_id      = var.app_insights_id
  query               = <<-QUERY
requests
${local.skip_on_weekends}
| where operation_Name has "FHIRTestEventReporter" 
and timestamp >= ago(7m)
and duration >= 180000
  QUERY

  trigger {
    operator  = "GreaterThan"
    threshold = 0
  }

  action {
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "unequal_okta_db_org_role_claims_alert" {
  name                = "${var.env}-unequal-okta-db-org-role-claims-alert"
  description         = "${local.env_title} User Okta and DB org claims are unequal"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = var.severity
  frequency           = 1440
  time_window         = 1440
  enabled             = contains(var.disabled_alerts, "unequal_okta_db_org_role_claims_alert") ? false : true

  data_source_id = var.app_insights_id

  query = <<-QUERY
traces
${local.skip_on_weekends}
| where severityLevel == "3"
| where timestamp > ago(1d)
| where message has "Okta OrganizationRoleClaims do not match database OrganizationRoleClaims for User ID: "
| parse message with * "Okta OrganizationRoleClaims do not match database OrganizationRoleClaims for User ID: " loggedUserId
| extend UserId = split(loggedUserId, ":")
| mv-expand UserId to typeof(string)
| summarize occurrences=count() by UserId
QUERY

  trigger {
    operator  = "GreaterThan"
    threshold = 0
  }

  action {
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}
