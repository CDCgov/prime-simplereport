data "azurerm_key_vault_certificate" "simplereport_gov" {
  key_vault_id = var.key_vault_id
  name         = "simplereport-gov"
}
