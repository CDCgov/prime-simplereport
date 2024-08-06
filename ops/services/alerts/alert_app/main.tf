locals {
  project   = "prime"
  env_level = "pentest"
  management_tags = {
    prime-app      = "simple-report"
    resource_group = "prime-simple-report-pentest"
  }
}

# Define the Resource Group
resource "azurerm_resource_group" "logic" {
  name     = var.rg_name
  location = var.rg_location
}

# Define the Logic App Workflow
resource "azurerm_logic_app_workflow" "slack_workflow" {
  name                = "alert-logic-app"
  location            = azurerm_resource_group.logic.location
  resource_group_name = azurerm_resource_group.logic.name


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
        "uri": "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.azure_alert_slack_webhook.id})",
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
  uri          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.azure_alert_slack_webhook.id})"
  headers = {
    "Content-Type" = "application/json"
  }
  body = <<BODY
{
  "text": "@{triggerBody()}"
}
BODY
}



