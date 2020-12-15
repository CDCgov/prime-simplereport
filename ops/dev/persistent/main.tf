module "all" {
  source = "../../services/all-persistent"
  env    = var.env
}

# VMs subnet
resource "azurerm_subnet" "vms" {
  name                 = "${var.env}-vms"
  resource_group_name  = data.azurerm_resource_group.rg.name
  virtual_network_name = data.azurerm_virtual_network.dev.name
  address_prefixes     = ["10.1.252.0/24"]
}

resource "azurerm_subnet" "lbs" {
  name                 = "${local.project}-${local.name}-${var.env}-lb"
  resource_group_name  = data.azurerm_resource_group.rg.name
  virtual_network_name = data.azurerm_virtual_network.dev.name
  address_prefixes     = ["10.1.254.0/24"]
}