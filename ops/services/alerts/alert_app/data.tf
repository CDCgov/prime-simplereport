
data "azurerm_key_vault_secret" "azure_alert_slack_webhook" {
  name         = "azure-alert-slack-webhook"
  key_vault_id = var.global_vault.id
}


data "azurerm_subscription" "primary" {

}

# Resource Groups
data "azurerm_resource_group" "rg" {
  # Environments are assembled into shared resource groups by environment level.
  name = "${local.project}-${local.name}-${local.env_level}"
}

data "azurerm_resource_group" "rg_global" {
  name = "${local.project}-${local.name}-management"
}

