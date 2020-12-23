# Create the virtual network and the persistent subnets
resource "azurerm_virtual_network" "vn" {
  name                = "simple-report-${local.env}-network"
  resource_group_name = data.azurerm_resource_group.test.name
  location            = data.azurerm_resource_group.test.location
  address_space = [
  "10.3.0.0/16"]

  tags = local.management_tags
}

# VMs subnet
resource "azurerm_subnet" "vms" {
  name                 = "${local.env}-vms"
  resource_group_name  = data.azurerm_resource_group.test.name
  virtual_network_name = azurerm_virtual_network.vn.name
  address_prefixes     = ["10.3.252.0/24"]
}

resource "azurerm_subnet" "lbs" {
  name                 = "${local.project}-${local.name}-${local.env}-lb"
  resource_group_name  = data.azurerm_resource_group.test.name
  virtual_network_name = azurerm_virtual_network.vn.name
  address_prefixes     = ["10.3.254.0/24"]
}