# To do log-based alerts, we need to make sure we're actually collecting AppServiceConsoleLogs from the API
data "azurerm_resource_group" "management" {
  name = "prime-simple-report-management"
}

data "azurerm_log_analytics_workspace" "global" {
  name                = "simple-report-log-workspace-global"
  resource_group_name = data.azurerm_resource_group.management.name
}

resource "azurerm_monitor_diagnostic_setting" "collect_appserviceconsolelogs" {
  name                       = "${local.env_title} API App Service console logs"
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
data "azurerm_resource_group" "app" {
  name = var.rg_name
}

resource "azurerm_monitor_scheduled_query_rules_alert" "graphql_query_validation_failures" {
  name                = "${var.env}-graphql-query-validation-failures"
  description         = "${local.env_title} GraphQL query validation failures"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name

  action {
    action_group = var.action_group_ids
  }

  data_source_id = var.app_service_id
  enabled        = true

  query = <<-QUERY
AppServiceConsoleLogs
  | where tolower(ResultDescription) contains "query failed to validate"
  QUERY

  severity    = 1
  frequency   = 5
  time_window = 5
  trigger {
    operator  = "GreaterThan"
    threshold = 3
  }
}
