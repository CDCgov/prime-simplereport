terraform {
  backend "azurerm" {
    resource_group_name = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name = "sr-tfstate"
    key = "test/persistent-terraform.tfstate"
  }
}
