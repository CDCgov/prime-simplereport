data "azurerm_key_vault_certificate" "wildcard_simplereport_gov" {
  key_vault_id = var.key_vault_id
  name         = "wildcard-simplereport-gov"
}
