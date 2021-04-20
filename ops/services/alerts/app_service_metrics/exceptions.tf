# To do log-based alerts, we need to make sure we're actually collecting AppServiceConsoleLogs from the API
data "azurerm_resource_group" "management" {
  name = "prime-simple-report-management"
}

data "azurerm_log_analytics_workspace" "global" {
  name                = "simple-report-log-workspace-global"
  resource_group_name = data.azurerm_resource_group.management.name
}

resource "azurerm_monitor_diagnostic_setting" "collect_appserviceconsolelogs" {
  name                       = "API App Service console logs"
  target_resource_id         = var.app_service_id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.global.id

  log {
    category = "AppServiceConsoleLogs"
    enabled  = true

    retention_policy {
      days    = 7
      enabled = true
    }
  }
}

# Add an alert for GraphQL query validation failures (more than 3 in a 5-minute window)
resource "azurerm_monitor_scheduled_query_rules_alert" "graphql_query_validation_failures" {
  name                = "graphql-query-validation-failures"
  location            = "East US"
  resource_group_name = "prime-simple-report-${var.env}"

  action {
    action_group = [var.action_group_id]
  }

  data_source_id = var.app_service_id
  description    = "Alert when GraphQL query validation failures occur in the API"
  enabled        = true

  query = <<-QUERY
AppServiceConsoleLogs
  | where tolower(ResultDescription) contains "Query failed to validate"
  QUERY

  severity    = 1
  frequency   = 5
  time_window = 5
  trigger {
    operator  = "GreaterThan"
    threshold = 3
  }
}
