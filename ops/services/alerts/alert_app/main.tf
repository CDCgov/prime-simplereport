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
  name     = var.logicAppName
  location = data.azurerm_resource_group.rg.location
  #Create below api_connection
  parameters = {
    connections = azurerm_api_connection.api_connection_1.id
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
          name = azurerm_api_connection.api_connection_1.name
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
    schemaId = {
      data = {
        essentials = {
          alertId = {
            type = "string"
          }
          alertRule = {
            type = "string"
          }
          severity = {
            type = "string"
          }
        }
        required = ["alertId", "alertRule", "severity"]
        type     = "object"
      }
      status = {
        type = "string"
      }
    }
    required = ["status", "data"]
    type     = "object"
  })

}

# resource "azurerm_logic_app_api_connection" "slack" {
#   name                = var.slackConnectionName
#   location            = data.azurerm_resource_group.rg.location
#   resource_group_name = data.azurerm_resource_group.rg.name
#
#   api {
#     id = "/subscriptions/${data.azurerm_subscription.primary.id}/providers/Microsoft.Web/locations/${data.azurerm_resource_group.rg_global.location}/managedApis/${var.connection_name}"
#   }
#
#   display_name = "slack"
# }


resource "azapi_resource" "createApiConnectionslack" {
  type      = "Microsoft.Web/connections@2015-08-01-preview"
  name      = var.connection_name
  parent_id = data.azurerm_resource_group.rg.id
  location  = data.azurerm_resource_group.rg.location


  body = jsonencode({
    properties = {

      api = {
        name        = var.connection_name
        displayName = "slack"
        description = "Slack is a team communication tool, that brings together all of your team communications in one place, instantly searchable and available wherever you go."
        iconUri     = "https://connectoricons-prod.azureedge.net/releases/v1.0.1669/1.0.1669.3522/slack/icon.png"
        brandColor  = "#78D4B6"
        id          = "/subscriptions/${data.azurerm_subscription.primary.id}/providers/Microsoft.Web/locations/${data.azurerm_resource_group.rg_global.location}/managedApis/${var.connection_name}"
        type        = "Microsoft.Web/locations/managedApis"
      }
    }
  })
}



resource "azurerm_api_connection" "api_connection_1" {
  managed_api_id      = azapi_resource.createApiConnectionslack.id
  name                = "SlackConnection"
  resource_group_name = data.azurerm_resource_group.rg.name
}
#
# resource "azurerm_api_connection" "res-6" {
#   managed_api_id      = azapi_resource.createApiConnectionslack.id
#   name                = "slack-1"
#   resource_group_name = data.azurerm_resource_group.rg.name
# }





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

