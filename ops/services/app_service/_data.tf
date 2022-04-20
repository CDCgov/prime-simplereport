data "terraform_remote_state" "global" {
  backend = "azurerm"
  config = {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "global/terraform.tfstate"
  }
}

data "azurerm_subscription" "primary" {
  
}

data "azurerm_key_vault_certificate" "wildcard_simplereport_gov" {
  key_vault_id = var.key_vault_id
  name         = "wildcard-simplereport-gov"
}
