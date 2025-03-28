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
  name                           = "${var.app_name}-${var.env}-network"
  resource_group_name            = var.resource_group_name
  location                       = var.location
  address_space                  = [var.network_address]
  private_endpoint_vnet_policies = "Basic"
  tags                           = var.management_tags
}

resource "azurerm_subnet" "vms" {
  count                             = var.env == "prod" ? 1 : 0
  name                              = "${var.env}-vms"
  resource_group_name               = var.resource_group_name
  virtual_network_name              = azurerm_virtual_network.vn.name
  address_prefixes                  = [cidrsubnet(var.network_address, 8, 252)] # X.X.252.0/24
  private_endpoint_network_policies = "Enabled"
}

resource "azurerm_subnet" "lbs" {
  name                 = "${local.subnet_basename}-lb"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.vn.name
  address_prefixes     = [cidrsubnet(var.network_address, 8, 254)] # X.X.254.0/24
  service_endpoints = [
    "Microsoft.Web",
    "Microsoft.Storage"
  ]
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

# The name of the private DNS zone MUST be environment-specific to support multiple envs within the same resource group.
resource "azurerm_private_dns_zone" "default" {
  name                = "privatelink.${var.env == var.env_level ? "" : "${var.env}."}postgres.database.azure.com"
  resource_group_name = var.resource_group_name
}

# DNS/VNet linkage for Flexible DB functionality
# TODO: Import the existing links for each standing environment.
resource "azurerm_private_dns_zone_virtual_network_link" "vnet_link" {
  name                  = "${var.env}-vnet-dns-link"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.default.name
  virtual_network_id    = azurerm_virtual_network.vn.id
}

# Subnet + network profile for Azure Container Instances
resource "azurerm_subnet" "container_instances" {
  name                 = "${var.env}-azure-container-instances"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.vn.name
  address_prefixes     = [cidrsubnet(var.network_address, 8, 101)] # X.X.101.0/24

  delegation {
    name = "${var.env}-container-instances"

    service_delegation {
      name    = "Microsoft.ContainerInstance/containerGroups"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

resource "azurerm_network_profile" "container_instances" {
  name                = "${var.env}-azure-container-instances"
  location            = var.location
  resource_group_name = var.resource_group_name

  container_network_interface {
    name = "${var.env}-container-instances"

    ip_configuration {
      name      = "${var.env}-container-instances"
      subnet_id = azurerm_subnet.container_instances.id
    }
  }
}

# Subnet for Flexible DBs
resource "azurerm_subnet" "db" {
  name                 = "${var.env}-db"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.vn.name
  address_prefixes     = [cidrsubnet(var.network_address, 8, 102)] # X.X.102.0/24

  delegation {
    name = "${var.env}-db"

    service_delegation {
      name    = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }
}
