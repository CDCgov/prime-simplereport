data "azurerm_key_vault_certificate" "certificate" {
  key_vault_id = var.key_vault_id
  name         = "simple-report-global"
}
