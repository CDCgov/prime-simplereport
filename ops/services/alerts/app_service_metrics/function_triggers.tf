resource "azurerm_monitor_action_group" "function_triggers" {
  name                = "${var.env}-function-triggers"
  resource_group_name = var.rg_name
  short_name          = "${var.env}-triggers"
}

resource "azurerm_monitor_alert_processing_rule_action_group" "function_triggers_group" {
  name                 = "${var.env}-function-triggers-processing"
  resource_group_name  = var.rg_name
  scopes               = [data.azurerm_resource_group.app.id]
  add_action_group_ids = [azurerm_monitor_action_group.function_triggers.id]

  condition {
    target_resource_type {
      operator = "Equals"
      values   = ["Microsoft.Web/azureFunctions"]
    }
    severity {
      operator = "Equals"
      values   = ["Sev0", "Sev1", "Sev2"]
    }
  }

  schedule {
    effective_from  = "2022-01-01T01:02:03"
    effective_until = "2022-02-02T01:02:03"
    time_zone       = "Eastern Standard Time"
    recurrence {
      daily {
        start_time = "09:00:00"
        end_time   = "20:00:00"
      }
      weekly {
        days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      }
    }
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

  auto_mitigation_enabled = true

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
    action_group = azurerm_monitor_action_group.function_triggers.id
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "fhir_batched_uploader_function_not_triggering" {
  name                = "${var.env}-fhir-batched-uploader-function-not-triggering"
  description         = "FHIRTestEventReporter is not triggering on schedule"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name
  severity            = var.severity
  frequency           = 5
  time_window         = 7
  enabled             = contains(var.disabled_alerts, "fhir_batched_uploader_function_not_triggering") ? false : true

  data_source_id = var.app_insights_id

  auto_mitigation_enabled = true

  query = <<-QUERY
requests
${local.skip_on_weekends}
| where timestamp >= ago(7m) 
    and operation_Name =~ 'FHIRTestEventReporter'
  QUERY

  trigger {
    operator  = "Equal"
    threshold = 0
  }

  action {
    action_group = azurerm_monitor_action_group.function_triggers.id
  }
}

