data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "sr" {
  location            = data.azurerm_resource_group.rg.location
  name                = "simple-report-global"
  resource_group_name = data.azurerm_resource_group.rg.name
  sku_name            = "standard"
  tenant_id           = data.azurerm_client_config.current.tenant_id
  soft_delete_enabled = true

  //  network_acls {
  //    bypass = "AzureServices"
  //    default_action = "Deny"
  //  }

  tags = local.management_tags
}

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