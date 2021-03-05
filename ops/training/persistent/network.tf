//# Create the virtual network and the persistent subnets
resource "azurerm_virtual_network" "vn" {
  name                = "simple-report-${local.env}-network"
  resource_group_name = data.azurerm_resource_group.training.name
  location            = data.azurerm_resource_group.training.location
  address_space = [
  "10.7.0.0/16"]

  tags = local.management_tags
}

# VMs subnet
resource "azurerm_subnet" "vms" {
  name                                           = "${local.env}-vms"
  resource_group_name                            = data.azurerm_resource_group.training.name
  virtual_network_name                           = azurerm_virtual_network.vn.name
  address_prefixes                               = ["10.7.252.0/24"]
  enforce_private_link_endpoint_network_policies = true
}

resource "azurerm_subnet" "lbs" {
  name                 = "${local.project}-${local.name}-${local.env}-lb"
  resource_group_name  = data.azurerm_resource_group.training.name
  virtual_network_name = azurerm_virtual_network.vn.name
  address_prefixes     = ["10.7.254.0/24"]
}

resource "azurerm_subnet" "webapp" {
  name                 = "${local.project}-${local.name}-${local.env}-webapp"
  resource_group_name  = data.azurerm_resource_group.training.name
  virtual_network_name = azurerm_virtual_network.vn.name
  address_prefixes     = ["10.7.100.0/24"]

  lifecycle {
    ignore_changes = [delegation]
  }
}