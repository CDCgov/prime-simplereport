# Modularized version of our standard virtual network configuration
# To migrate to this from the hard-coded version, you will need to run the
# following commands from the 'persistent' directory:
# terraform state mv azurerm_virtual_network.vn module.vnet.azurerm_virtual_network.vn
# terraform state mv azurerm_subnet.vms module.vnet.azurerm_subnet.vms
# terraform state mv azurerm_subnet.lbs module.vnet.azurerm_subnet.lbs
# terraform state mv azurerm_subnet.webapp module.vnet.azurerm_subnet.webapp

locals {
  subnet_basename = "${var.project}-${var.app_name}-${var.env}"
}

# Create the virtual network and the persistent subnets
resource "azurerm_virtual_network" "vn" {
  name                = "${var.app_name}-${var.env}-network"
  resource_group_name = var.resource_group_name
  location            = var.location
  address_space       = [var.network_address]

  tags = var.management_tags
}

# VMs subnet
resource "azurerm_subnet" "vms" {
  # We did try to rename this, but it turns out we have manual infrastructure attached to this subnet,
  # so renaming it (by which we mean destroying and rebuilding it) would be a bit complicated.
  # That manual infrastructure should be imported (see #1360)--if that is done, revisit this.
  name                                           = "${var.env}-vms"
  resource_group_name                            = var.resource_group_name
  virtual_network_name                           = azurerm_virtual_network.vn.name
  address_prefixes                               = [cidrsubnet(var.network_address, 8, 252)] # X.X.252.0/24
  enforce_private_link_endpoint_network_policies = true
}

resource "azurerm_subnet" "lbs" {
  name                 = "${local.subnet_basename}-lb"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.vn.name
  address_prefixes     = [cidrsubnet(var.network_address, 8, 254)] # X.X.254.0/24
}

resource "azurerm_subnet" "webapp" {
  name                 = "${local.subnet_basename}-webapp"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.vn.name
  address_prefixes     = [cidrsubnet(var.network_address, 8, 100)] # X.X.100.0/24

  delegation {
    name = "serverfarms"
    service_delegation {
      name = "Microsoft.Web/serverFarms"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/action"
      ]
    }
  }
}
