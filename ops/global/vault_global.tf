data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "sr" {
  location            = data.azurerm_resource_group.rg.location
  name                = "simple-report-global"
  resource_group_name = data.azurerm_resource_group.rg.name
  sku_name            = "standard"
  tenant_id           = data.azurerm_client_config.current.tenant_id
  soft_delete_enabled = true

  tags = local.management_tags
}

# Devops Team Permissions
resource "azurerm_key_vault_access_policy" "team_access" {
  count        = length(var.infra_team)
  key_vault_id = azurerm_key_vault.sr.id
  object_id    = var.infra_team[count.index]
  tenant_id    = data.azurerm_client_config.current.tenant_id

  key_permissions = [
    "get",
    "list",
    "create",
    "delete",
    "recover",
  ]

  secret_permissions = [
    "get",
    "list",
    "set",
    "delete",
    "recover",
  ]

  certificate_permissions = [
    "get",
    "list",
    "import",
    "create",
    "delete",
    "recover",
  ]

  storage_permissions = [
    "get",
    "list",
    "set",
    "delete",
    "recover",
  ]
}

# Secret for Slack Web Notification
resource "azurerm_key_vault_secret" "slack_webhook" {
  key_vault_id = azurerm_key_vault.sr.id
  name         = "simple-report-global-slack-webhook"
  value        = var.slack_webhook
}
