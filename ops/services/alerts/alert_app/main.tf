locals {
  project   = "prime"
  name      = "simple-report"
  env_level = "pentest"
  management_tags = {
    prime-app      = "simple-report"
    resource_group = data.azurerm_resource_group.rg.name
  }
}




#Define the action group, call it as local variable
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


