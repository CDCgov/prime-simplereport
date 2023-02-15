data "azurerm_client_config" "current" {}

resource "azurerm_user_assigned_identity" "gateway" {
  name                = "prime-simple-report-${var.env}-gateway"
  location            = var.resource_group_location
  resource_group_name = var.resource_group_name

  tags = var.tags
}

resource "azurerm_key_vault_access_policy" "gateway" {
  key_vault_id = var.key_vault_id
  object_id    = azurerm_user_assigned_identity.gateway.principal_id
  tenant_id    = data.azurerm_client_config.current.tenant_id

  secret_permissions = ["Get"]
}
