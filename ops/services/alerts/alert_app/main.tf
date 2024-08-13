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
  name     = "alert-logic-app"
  location = data.azurerm_resource_group.rg.location
  #Create below api_connection
  parameters = {
    connections = azurerm_api_connection.res-6.id
  }
  resource_group_name = data.azurerm_resource_group.rg.name
  workflow_parameters = {
    connection = "{\"defaultValue\":{},\"type\":\"Object\"}"
  }
}


# Define the Logic App Workflow Action
resource "azurerm_logic_app_action_http" "workflow_action" {
  logic_app_id = azurerm_logic_app_workflow.slack_workflow.id
  name         = "Http"
  method       = "POST"
  #How to get this uri programmtically
  uri = data.azurerm_key_vault_secret.azure_alert_slack_webhook.value
  body = jsonencode({
    "text" : "Hi from postman"
  })
  headers = {
    Content-Type = "application/json"
  }
}


resource "azurerm_logic_app_action_custom" "res-3" {
  body = jsonencode({
    inputs = {
      host = {
        connection = {
          name = azurerm_api_connection.res-6.id
        }
      }
      method = "post"
      path   = "/chat.postMessage"
      queries = {
        channel = var.channel
        text    = "Azure Alert - '@{triggerBody()['context']['name']}' @{triggerBody()['status']} on '@{triggerBody()['context']['resourceName']}'.  Details: @{body('Http')['id']}"
      }
    }
    runAfter = {
      Http = ["Succeeded"]
    }
    type = "ApiConnection"
  })
  logic_app_id = azurerm_logic_app_workflow.slack_workflow.id
  name         = "Post_Message"
}

resource "azurerm_logic_app_trigger_http_request" "res-4" {
  logic_app_id = azurerm_logic_app_workflow.slack_workflow.id
  name         = "manual"
  schema = jsonencode({
    "$schema" = "http://json-schema.org/draft-04/schema#"
    properties = {
      context = {
        properties = {
          name = {
            type = "string"
          }
          portalLink = {
            type = "string"
          }
          resourceName = {
            type = "string"
          }
        }
        required = ["name", "portalLink", "resourceName"]
        type     = "object"
      }
      status = {
        type = "string"
      }
    }
    required = ["status", "context"]
    type     = "object"
  })

}

data "azurerm_managed_api" "data_api" {
  name     = "managed-api-1"
  location = data.azurerm_resource_group.rg.location
}

resource "azurerm_api_connection" "api_connection_1" {
  managed_api_id      = data.azurerm_managed_api.data_api
  name                = "SlackConnection"
  resource_group_name = data.azurerm_resource_group.rg.name
}

resource "azurerm_api_connection" "res-6" {
  managed_api_id      = data.azurerm_managed_api.data_api
  name                = "slack-1"
  resource_group_name = data.azurerm_resource_group.rg.name
}





resource "azurerm_monitor_action_group" "on_call_action_group" {
  name                = "OnCallEngineer"
  resource_group_name = data.azurerm_resource_group.rg.name
  short_name          = "OnCall"
  webhook_receiver {
    name                    = "logicappaction"
    service_uri             = data.azurerm_key_vault_secret.azure_alert_slack_webhook.value
    use_common_alert_schema = false
  }
}

