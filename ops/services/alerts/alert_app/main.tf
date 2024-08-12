locals {
  project   = "prime"
  name      = "simple-report"
  env_level = "pentest"
  management_tags = {
    prime-app      = "simple-report"
    resource_group = data.azurerm_resource_group.rg.name
  }
}


# Define the Logic App Workflow
resource "azurerm_logic_app_workflow" "slack_workflow" {
  name                = "alert-logic-app"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name


}

# Define the Logic App Workflow Trigger
resource "azurerm_logic_app_trigger_http_request" "workflow_trigger" {
  logic_app_id = azurerm_logic_app_workflow.slack_workflow.id
  name         = "Alert_monitor"
  schema       = <<SCHEMA
{
  "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
  "contentVersion": "1.0.0.0",
  "outputs": {},
  "triggers": {
    "Alert_monitors": {
      "type": "Request",
      "kind": "Http",
      "inputs": {
        "schema": {
          "type": "object",
          "properties": {}
        }
      }
    }
  },
  "actions": {
    "Post_message_to_Slack": {
      "type": "Http",
      "inputs": {
        "method": "POST",
        "uri": "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.azure_alert_slack_webhook.value})",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "text": "@{triggerBody()}"
        }
      }
    }
  }
}
SCHEMA
}

# Define the Logic App Workflow Action
resource "azurerm_logic_app_action_http" "workflow_action" {
  logic_app_id = azurerm_logic_app_workflow.slack_workflow.id
  name         = "Post_message_to_Slack"
  method       = "POST"
  uri          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.azure_alert_slack_webhook.value})"
  headers = {
    "Content-Type" = "application/json"
  }
  body = <<BODY
{
  "text": "@{triggerBody()}"
}
BODY
}


#Define the action group, call it as local variable
resource "azurerm_monitor_action_group" "on_call_action_group" {
  name                = "OnCallEngineer"
  resource_group_name = data.azurerm_resource_group.rg.name
  short_name          = "OnCall"
  logic_app_receiver {
    name                    = "logicappaction"
    resource_id             = azurerm_logic_app_workflow.slack_workflow.id
    callback_url            = data.azurerm_key_vault_secret.azure_alert_slack_webhook.value
    use_common_alert_schema = false
  }
}


# Define the Alert Rule for the action group to be notified
resource "azurerm_monitor_activity_log_alert" "log_alert" {
  name                = "slack-logic-app-alert"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
  scopes              = [azurerm_logic_app_workflow.slack_workflow.id]
  description         = "Alert when the Logic App workflow is triggered."
  enabled             = true

  criteria {
    category       = "ResourceHealth"
    operation_name = "Microsoft.Logic/workflows/workflowRuns/write"
  }

  action {
    action_group_id = azurerm_monitor_action_group.on_call_action_group.id
  }
}