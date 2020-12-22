locals {
  envs = ["dev", "test", "stg", "prod"]
}

resource "azurerm_key_vault" "db_keys" {
  location                   = data.azurerm_resource_group.rg.location
  name                       = "simple-report-db-keys"
  resource_group_name        = data.azurerm_resource_group.rg.name
  sku_name                   = "standard"
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  soft_delete_enabled        = true
  soft_delete_retention_days = 90
  purge_protection_enabled   = true

  tags = local.management_tags
}

resource "azurerm_key_vault_key" "db_encryption_keys" {
  count        = length(local.envs)
  name         = local.envs[count.index]
  key_vault_id = azurerm_key_vault.db_keys.id
  key_type     = "RSA"
  key_size     = 2048
  key_opts = [
    "decrypt",
    "encrypt",
    "sign",
    "unwrapKey",
    "verify",
    "wrapKey",
  ]
}


# Devops Team Permissions
resource "azurerm_key_vault_access_policy" "team_db_access" {
  count        = length(var.infra_team)
  key_vault_id = azurerm_key_vault.db_keys.id
  object_id    = var.infra_team[count.index]
  tenant_id    = data.azurerm_client_config.current.tenant_id

  key_permissions = [
    "backup",
    "create",
    "decrypt",
    "delete",
    "encrypt",
    "get",
    "import",
    "list",
    "purge",
    "recover",
    "restore",
    "sign",
    "unwrapKey",
    "update",
    "verify",
    "wrapKey",
  ]

  secret_permissions = ["get", ]

  certificate_permissions = ["get", ]

  storage_permissions = ["get", ]
}