locals {
  envs = ["dev", "test", "stg", "prod", "demo", "pentest", "training"]
}

resource "azurerm_key_vault" "db_keys" {
  location                   = data.azurerm_resource_group.rg.location
  name                       = "simple-report-db-keys"
  resource_group_name        = data.azurerm_resource_group.rg.name
  sku_name                   = "standard"
  tenant_id                  = data.azurerm_client_config.current.tenant_id
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