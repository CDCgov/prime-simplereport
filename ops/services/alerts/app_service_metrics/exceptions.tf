# To do log-based alerts, we need to make sure we're actually collecting AppServiceConsoleLogs from the API
resource "azurerm_monitor_diagnostic_setting" "collect_appserviceconsolelogs" {
  name                       = "${local.env_title} API App Service console logs"
  target_resource_id         = var.app_service_id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.global.id

  enabled_log {
    category = "AppServiceConsoleLogs"
    retention_policy {
      days    = 7
      enabled = true
    }
  }
  metric {
    category = "AllMetrics"
    enabled  = false
    retention_policy {
      days    = 0
      enabled = false
    }
  }
}

# Add an alert for GraphQL query validation failures (more than 2 in a 5-minute window)
resource "azurerm_monitor_scheduled_query_rules_alert" "graphql_query_validation_failures" {
  name                = "${var.env}-graphql-query-validation-failures"
  description         = "${local.env_title} GraphQL query validation failures"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name

  action {
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
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
    threshold = 2
  }
<<<<<<< HEAD
<<<<<<< HEAD
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
=======
  tags = var.cdc_tags
>>>>>>> 0278ebe75 (feat: add required CDC tags to various terraform resources for tracking and compliance)
=======
>>>>>>> 52761b486 (feat: updated keys and Dev* deployment workflow)
}

resource "azurerm_monitor_scheduled_query_rules_alert" "first_error_in_a_week" {
  name                = "${var.env}-first-error-in-a-week"
  description         = "${local.env_title} alert when an error is seen for the first time in a week"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name

  action {
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }

  data_source_id = var.app_insights_id
  enabled        = false

  # - Collect all requests that were exceptions in the week preceeding today
  # - Do the same for today
  # - leftanti join the two result sets to return only results from today that were not found in the week preceeding today
  query = <<-QUERY
requests
| where timestamp <= now() and timestamp > now(-1d) and success == false
| join kind= inner (
    exceptions
    | where timestamp <= now() and timestamp > now(-1d)
    )
    on operation_Id
| project stackTrace = details[0].rawStack, exceptionType = type, failedMethod = method, requestName = name, combinedErrorString = strcat(type, method, name), timestamp
| join kind= leftanti (
    requests
    | where timestamp <= now(-1d) and timestamp > now(-8d) and success == false
    | join kind= inner (
        exceptions
        | where timestamp <= now(-1d) and timestamp > now(-8d)
        )
        on operation_Id
    | project stackTrace = details[0].rawStack, exceptionType = type, failedMethod = method, requestName = name, combinedErrorString = strcat(type, method, name)
    )
    on combinedErrorString
| summarize stackTrace = any(stackTrace) by failedMethod, requestName, exceptionType, timestamp
| sort by timestamp
  QUERY

  severity    = 2
  frequency   = 60 // Run hourly
  time_window = 1440
  trigger {
    operator  = "GreaterThan"
    threshold = 0
  }
<<<<<<< HEAD
<<<<<<< HEAD
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
=======
  tags = var.cdc_tags
>>>>>>> 0278ebe75 (feat: add required CDC tags to various terraform resources for tracking and compliance)
=======
>>>>>>> 52761b486 (feat: updated keys and Dev* deployment workflow)
}

resource "azurerm_monitor_scheduled_query_rules_alert" "account_request_failures" {
  name                = "${var.env}-account-request-failures"
  description         = "${local.env_title} alert when an AccountRequestFailureException is seen"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name

  action {
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }

  data_source_id = var.app_insights_id
  enabled        = contains(var.disabled_alerts, "account_request_failures") ? false : true

  query = <<-QUERY
requests
${local.skip_on_weekends}
| where timestamp > ago(2h) and success == false
| join kind= inner (
    exceptions
    | where timestamp > ago(2h)
    )
    on operation_Id
| where type hassuffix "AccountRequestFailureException"
| project timestamp, exceptionType = type, failedMethod = method, requestName = name
  QUERY

  severity    = 1
  frequency   = 5
  time_window = 5
  trigger {
    operator  = "GreaterThan"
    threshold = 4
  }
<<<<<<< HEAD
<<<<<<< HEAD
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
=======
  tags = var.cdc_tags
>>>>>>> 0278ebe75 (feat: add required CDC tags to various terraform resources for tracking and compliance)
=======
>>>>>>> 52761b486 (feat: updated keys and Dev* deployment workflow)
}

resource "azurerm_monitor_scheduled_query_rules_alert" "experian_auth_failures" {
  name                = "${var.env}-experian-auth-failures"
  description         = "${local.env_title} alert when an ExperianAuthException is seen unless the details indicate the error is a 500"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name

  action {
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }

  data_source_id = var.app_insights_id
  enabled        = contains(var.disabled_alerts, "experian_auth_failures") ? false : true

  query = <<-QUERY
requests
${local.skip_on_weekends}
| where timestamp > ago(2h) and success == false
| join kind= inner (
    exceptions
    | where timestamp > ago(2h) and details[0]["rawStack"] !contains "500 Internal Server Error"
    )
    on operation_Id
| where type hassuffix "ExperianAuthException"
| project timestamp, exceptionType = type, failedMethod = method, requestName = name
  QUERY

  severity    = 1
  frequency   = 5
  time_window = 5
  trigger {
    operator  = "GreaterThan"
    threshold = 0
  }
<<<<<<< HEAD
<<<<<<< HEAD
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
=======
  tags = var.cdc_tags
>>>>>>> 0278ebe75 (feat: add required CDC tags to various terraform resources for tracking and compliance)
=======
>>>>>>> 52761b486 (feat: updated keys and Dev* deployment workflow)
}

resource "azurerm_monitor_scheduled_query_rules_alert" "all_experian_auth_failures" {
  name                = "${var.env}-all-experian-auth-failures"
  description         = "${local.env_title} alert when two or more ExperianAuthExceptions are seen"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name

  action {
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }

  data_source_id = var.app_insights_id
  enabled        = contains(var.disabled_alerts, "experian_auth_failures") ? false : true

  query = <<-QUERY
requests
${local.skip_on_weekends}
| where timestamp > ago(2h) and success == false
| join kind= inner (
    exceptions
    | where timestamp > ago(2h)
    )
    on operation_Id
| where type hassuffix "ExperianAuthException"
| project timestamp, exceptionType = type, failedMethod = method, requestName = name
  QUERY

  severity    = 1
  frequency   = 5
  time_window = 5
  trigger {
    operator  = "GreaterThan"
    threshold = 2
  }
<<<<<<< HEAD
<<<<<<< HEAD
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
=======
  tags = var.cdc_tags
>>>>>>> 0278ebe75 (feat: add required CDC tags to various terraform resources for tracking and compliance)
=======
>>>>>>> 52761b486 (feat: updated keys and Dev* deployment workflow)
}

resource "azurerm_monitor_scheduled_query_rules_alert" "frontend_error_boundary" {
  name                = "${var.env}-frontend-error-boundary"
  description         = "${local.env_title} uncaught frontend exceptions caught by PrimeErrorBoundary"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = var.rg_name

  action {
    action_group           = var.action_group_ids
    custom_webhook_payload = var.wiki_docs_text
  }

  data_source_id = var.app_insights_id
  enabled        = contains(var.disabled_alerts, "frontend_error_boundary") ? false : true

  query = <<-QUERY
 exceptions
 ${local.skip_on_weekends}
 | where type startswith "PrimeErrorBoundary"
  QUERY

  severity    = 1
  frequency   = 5
  time_window = 5
  trigger {
    operator  = "GreaterThan"
    threshold = 0
  }
<<<<<<< HEAD
<<<<<<< HEAD
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
=======
  tags = var.cdc_tags
>>>>>>> 0278ebe75 (feat: add required CDC tags to various terraform resources for tracking and compliance)
=======
>>>>>>> 52761b486 (feat: updated keys and Dev* deployment workflow)
}
