data "azurerm_resource_group" "app" {
  name = var.rg_name
}


data "azurerm_key_vault_secret" "azure_alert_slack_webhook" {
  name         = "azure-alert-slack-webhook"
  key_vault_id = var.global_vault.id
}
