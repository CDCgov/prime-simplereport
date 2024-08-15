locals {
  project   = "prime"
  name      = "simple-report"
  env_level = "pentest"
  management_tags = {
    prime-app      = "simple-report"
    resource_group = data.azurerm_resource_group.rg.name
  }
  slack_api_id        = "${data.azurerm_subscription.primary.id}/resourceGroups/${data.azurerm_resource_group.rg.name}/providers/Microsoft.Web/locations/${data.azurerm_resource_group.rg_global.location}/managedApis/slack"
  slack_connection_id = "${data.azurerm_subscription.primary.id}/resourceGroups/${data.azurerm_resource_group.rg.name}/providers/Microsoft.Web/connections/${var.slackConnectionName}"

}


# Define the Logic App Workflow
resource "azurerm_logic_app_workflow" "slack_workflow" {
  name     = var.logicAppName
  location = data.azurerm_resource_group.rg.location
  parameters = {
    "$connections" = "{\"slack\":{\"connectionId\":\"${data.azurerm_subscription.primary.id}/resourceGroups/${data.azurerm_resource_group.rg.name}/providers/Microsoft.Web/connections/slack\",\"connectionName\":\"slack\",\"id\":\"${data.azurerm_subscription.primary.id}/providers/Microsoft.Web/locations/eastus/managedApis/slack\"}}"
  }
  resource_group_name = data.azurerm_resource_group.rg.name
  workflow_parameters = {
    "$connections" = "{\"defaultValue\":{},\"type\":\"Object\"}"
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
    "text" : "@{triggerBody()?['data']?['essentials']?['alertId']}"
  })
  headers = {
    Content-Type = "application/json"
  }
}

#
# resource "azurerm_logic_app_action_custom" "res-3" {
#   body = jsonencode({
#     inputs = {
#       host = {
#         connection = {
#           name = "@parameters('$connections')['slack']['connectionId']"
#         }
#
#       }
#       method = "post"
#       path   = "/chat.postMessage"
#       queries = {
#         channel = var.channel
#         text    = "Azure Alert - '@{triggerBody()['context']['name']}' @{triggerBody()['status']} on '@{triggerBody()['context']['resourceName']}'.  Details: @{body('Http')['id']}"
#       }
#     }
#     runAfter = {
#       Http = ["Succeeded"]
#     }
#     type = "ApiConnection"
#   })
#   logic_app_id = azurerm_logic_app_workflow.slack_workflow.id
#   name         = "Post_Message"
# }

resource "azurerm_logic_app_trigger_http_request" "res-4" {
  logic_app_id = azurerm_logic_app_workflow.slack_workflow.id
  name         = "When a HTTP request is received"
  schema       = <<SCHEMA
{
  "type": "Request",
  "kind": "Http",
  "inputs": {
    "schema": {
      "type": "object",
      "properties": {
        "schemaId": {
          "type": "string"
        },
        "data": {
          "type": "object",
          "properties": {
            "essentials": {
              "type": "object",
              "properties": {
                "alertId": {
                  "type": "string"
                },
                "alertRule": {
                  "type": "string"
                },
                "severity": {
                  "type": "string"
                },
                "signalType": {
                  "type": "string"
                },
                "monitorCondition": {
                  "type": "string"
                },
                "monitoringService": {
                  "type": "string"
                },
                "alertTargetIDs": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "configurationItems": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "originAlertId": {
                  "type": "string"
                },
                "firedDateTime": {
                  "type": "string"
                },
                "resolvedDateTime": {
                  "type": "string"
                },
                "description": {
                  "type": "string"
                },
                "essentialsVersion": {
                  "type": "string"
                },
                "alertContextVersion": {
                  "type": "string"
                }
              }
            },
            "alertContext": {
              "type": "object",
              "properties": {
                "properties": {},
                "conditionType": {
                  "type": "string"
                },
                "condition": {
                  "type": "object",
                  "properties": {
                    "windowSize": {
                      "type": "string"
                    },
                    "allOf": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "metricName": {
                            "type": "string"
                          },
                          "metricNamespace": {
                            "type": "string"
                          },
                          "operator": {
                            "type": "string"
                          },
                          "threshold": {
                            "type": "string"
                          },
                          "timeAggregation": {
                            "type": "string"
                          },
                          "dimensions": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "name": {
                                  "type": "string"
                                },
                                "value": {
                                  "type": "string"
                                }
                              },
                              "required": [
                                "name",
                                "value"
                              ]
                            }
                          },
                          "metricValue": {
                            "type": "number"
                          }
                        },
                        "required": [
                          "metricName",
                          "metricNamespace",
                          "operator",
                          "threshold",
                          "timeAggregation",
                          "dimensions",
                          "metricValue"
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

SCHEMA
}




resource "azapi_resource" "createApiConnectionslack" {
  type                      = "Microsoft.Web/connections@2015-08-01-preview"
  name                      = var.connection_name
  parent_id                 = data.azurerm_resource_group.rg.id
  location                  = data.azurerm_resource_group.rg.location
  schema_validation_enabled = false


  body = jsonencode({
    properties = {

      api = {
        name        = var.connection_name
        displayName = "slack"
        description = "Slack is a team communication tool, that brings together all of your team communications in one place, instantly searchable and available wherever you go."
        iconUri     = "https://connectoricons-prod.azureedge.net/releases/v1.0.1669/1.0.1669.3522/slack/icon.png"
        brandColor  = "#78D4B6"
        id          = "${data.azurerm_subscription.primary.id}/providers/Microsoft.Web/locations/${data.azurerm_resource_group.rg_global.location}/managedApis/${var.connection_name}"
        type        = "Microsoft.Web/locations/managedApis"
      }
    }
  })
}



resource "azurerm_api_connection" "api_connection_1" {
  managed_api_id      = "${data.azurerm_subscription.primary.id}/providers/Microsoft.Web/locations/${data.azurerm_resource_group.rg_global.location}/managedApis/${var.connection_name}"
  name                = "SlackConnection"
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

