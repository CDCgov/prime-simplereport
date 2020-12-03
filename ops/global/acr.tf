resource "azurerm_container_registry" "sr" {
  location            = data.azurerm_resource_group.rg.location
  name                = "simplereportacr"
  resource_group_name = data.azurerm_resource_group.rg.name
  sku                 = "Standard"

  tags = local.management_tags
}

resource "azurerm_container_registry" "sr_api" {
  location            = data.azurerm_resource_group.rg.location
  name                = "simplereportapi"
  resource_group_name = data.azurerm_resource_group.rg.name
  sku                 = "Standard"

  tags = local.management_tags
}