resource "azurerm_container_registry" "sr" {
  location            = data.azurerm_resource_group.rg.location
  name                = "simplereportacr"
  resource_group_name = data.azurerm_resource_group.rg.name
  sku                 = "Standard"

  tags = local.management_tags
}