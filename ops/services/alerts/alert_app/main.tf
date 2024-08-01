locals {
  project   = "prime"
  name      = "simple-report"
  env       = "pentest"
  env_level = "pentest"
  management_tags = {
    prime-app      = "simple-report"
    environment    = local.env
    resource_group = "prime-simple-report-prod"
  }
}



# Define the Resource Group
resource "azurerm_resource_group" "logic" {
  name     = "prime-simple-report-pentest"
  location = "East US"
}

# Define the Logic App Workflow
resource "azurerm_logic_app_workflow" "slack_workflow" {
  name                = "alert-logic-app"
  location            = azurerm_resource_group.logic.location
  resource_group_name = azurerm_resource_group.logic.name

  definition = <<DEFINITION
{
  "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
  "contentVersion": "1.0.0.0",
  "outputs": {},
  "triggers": {
    "When_a_resource_event_occurs": {
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
        "uri": "https://hooks.slack.com/services/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",
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
DEFINITION
}

# Define the Logic App Workflow Trigger
resource "azurerm_logic_app_trigger_http_request" "example" {
  logic_app_id = azurerm_logic_app_workflow.slack_workflow.id
  name         = "Alert_monitor"
}

# Define the Logic App Workflow Action
resource "azurerm_logic_app_action_http" "example" {
  logic_app_id    = azurerm_logic_app_workflow.slack_workflow.id
  name            = "Post_message_to_Slack"
  method          = "POST"
  url             = "https://hooks.slack.com/services/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"
  headers = {
    "Content-Type" = "application/json"
  }
  body = <<BODY
{
  "text": "@{triggerBody()}"
}
BODY
}


