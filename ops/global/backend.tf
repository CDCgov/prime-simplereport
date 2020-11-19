terraform {
  backend "azurerm" {
    resource_group_name = "prime-simple-report-prod"
    storage_account_name = "usdssimplereportprod"
    container_name = "sr-tfstate"
    key = "global/terraform.tfstate"
  }
}
