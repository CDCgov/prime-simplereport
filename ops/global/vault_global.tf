data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "sr" {
  location                 = data.azurerm_resource_group.rg.location
  name                     = "simple-report-global"
  resource_group_name      = data.azurerm_resource_group.rg.name
  sku_name                 = "standard"
  tenant_id                = data.azurerm_client_config.current.tenant_id
  purge_protection_enabled = true

  tags = local.management_tags
}