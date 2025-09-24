resource "azurerm_monitor_alert_processing_rule_suppression" "function_triggers_suppression" {
  name                = "${var.env}-function-triggers-suppression"
  resource_group_name = var.rg_name
  scopes              = [data.azurerm_resource_group.app.id]

  condition {
    target_resource_type {
      operator = "Equals"
      values   = ["Microsoft.Web/azureFunctions"]
    }
    severity {
      operator = "Equals"
      values   = ["Sev4"]
    }
  }

  schedule {
    effective_from  = "2022-01-01T01:02:03"
    effective_until = "2022-02-02T01:02:03"
    time_zone       = "Eastern Standard Time"
    recurrence {
      daily {
        start_time = "20:00:00"
        end_time   = "09:00:00"
      }
      weekly {
        days_of_week = ["Saturday", "Sunday"]
      }
    }
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "batched_uploader_function_not_triggering" {
  name                = "${var.env}-batched-uploader-function-not-triggering"
  description         = "QueueBatchedReportStreamUploader is not triggering on schedule"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = 4
  frequency           = 5
  time_window         = 15
  enabled             = contains(var.disabled_alerts, "batched_uploader_function_not_triggering") ? false : true

  data_source_id = var.app_insights_id

  auto_mitigation_enabled = true

  query = <<-QUERY
requests
| where timestamp >= ago(15m) 
    and operation_Name =~ 'QueueBatchedReportStreamUploader'
  QUERY

  trigger {
    operator  = "Equal"
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

resource "azurerm_monitor_scheduled_query_rules_alert" "fhir_batched_uploader_function_not_triggering" {
  name                = "${var.env}-fhir-batched-uploader-function-not-triggering"
  description         = "FHIRTestEventReporter is not triggering on schedule"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = 4
  frequency           = 5
  time_window         = 15
  enabled             = contains(var.disabled_alerts, "fhir_batched_uploader_function_not_triggering") ? false : true

  data_source_id = var.app_insights_id

  auto_mitigation_enabled = true

  query = <<-QUERY
requests
| where timestamp >= ago(15m) 
    and operation_Name =~ 'FHIRTestEventReporter'
  QUERY

  trigger {
    operator  = "Equal"
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

resource "azurerm_monitor_scheduled_query_rules_alert" "send_to_aims_function_not_triggering" {
  name                = "${var.env}-send-to-aims-function-not-triggering"
  description         = "AIMS Uploader is not triggering on schedule"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = 4
  frequency           = 60
  time_window         = 1440
  enabled             = contains(var.disabled_alerts, "send_to_aims_function_not_triggering") ? false : true

  data_source_id = var.app_insights_id

  auto_mitigation_enabled = true

  query = <<-QUERY
requests
| where timestamp >= ago(1d)
    and operation_Name =~ 'SendToAIMS'
  QUERY

  trigger {
    operator  = "Equal"
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

