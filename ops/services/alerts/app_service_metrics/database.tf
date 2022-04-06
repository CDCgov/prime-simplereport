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

resource "azurerm_monitor_scheduled_query_rules_alert" "db_connection_exhaustion" {
  name                = "${var.env}-db-connection-exhaustion"
  description         = "${local.env_title} instances of DB connection exhaustion"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name

  action {
    action_group = var.action_group_ids
  }

  data_source_id = var.database_id
  enabled        = contains(var.disabled_alerts, "db_connection_exhaustion") ? false : true

  query = <<-QUERY
 AzureDiagnostics
 ${local.skip_on_weekends}
 | where errorLevel_s == "FATAL" and Message startswith "remaining connection slots are reserved"
  QUERY

  severity    = 1
  frequency   = 5
  time_window = 5
  trigger {
    operator  = "GreaterThan"
    threshold = 5
  }
}
