data "azurerm_resource_group" "rg" {
  name = "prime-simple-report-management"
}

data "okta_group" "everyone" {
  name = "Everyone"
}
