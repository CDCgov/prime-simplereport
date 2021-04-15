# Modularized version of our standard virtual network configuration
# To migrate to this from the hard-coded version, you will need to run the
# following commands from the 'persistent' directory:
# terraform state mv azurerm_virtual_network.vn module.vnet.azurerm_virtual_network.vn
# terraform state mv azurerm_subnet.vms module.vnet.azurerm_subnet.vms
# terraform state mv azurerm_subnet.lbs module.vnet.azurerm_subnet.lbs
# terraform state mv azurerm_subnet.webapp module.vnet.azurerm_subnet.webapp


# Create the virtual network and the persistent subnets
resource "azurerm_virtual_network" "vn" {
  name                = "${var.name}-${var.env}-network"
  resource_group_name = var.resource_group_name
  location            = var.location
  address_space       = [var.network_address]

  tags = var.management_tags
}

# VMs subnet
resource "azurerm_subnet" "vms" {
  name                                           = "${var.env}-vms"
  resource_group_name                            = var.resource_group_name
  virtual_network_name                           = azurerm_virtual_network.vn.name
  address_prefixes                               = [cidrsubnet(var.network_address, 8, 252)]
  enforce_private_link_endpoint_network_policies = true
}

resource "azurerm_subnet" "lbs" {
  name                 = "${var.project}-${var.name}-${var.env}-lb"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.vn.name
  address_prefixes     = [cidrsubnet(var.network_address, 8, 254)]
}

resource "azurerm_subnet" "webapp" {
  name                 = "${var.project}-${var.name}-${var.env}-webapp"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.vn.name
  address_prefixes     = [cidrsubnet(var.network_address, 8, 100)]

  # we need to actually do the delegation instead!
  lifecycle {
    ignore_changes = [delegation]
  }
}
