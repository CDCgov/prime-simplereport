# Sets up a NAT gateway to be able to specifically route outbound traffic:
# - Creates a static IP
# - Create a NAT gateway
# - Associate the static IP with the NAT gateway
# - Associate the NAT gateway with the webapp and load balancer subnets
#
# The above will cause all outbound traffic from the associated subnets
# to pass through the NAT gateway and originate from the static IP. The
# static IP can then be used for allowlists.

resource "azurerm_public_ip" "nat_outbound_static_ip" {
  name                = "${var.name}-${var.env}-nat-outbound-static-ip"
  location            = var.resource_group_location
  resource_group_name = var.resource_group_name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = var.tags
  zones               = ["1","2","3"]
}

resource "azurerm_nat_gateway" "outbound" {
  name                = "${var.name}-${var.env}-outbound-nat-gateway"
  location            = var.resource_group_location
  resource_group_name = var.resource_group_name
  sku_name            = "Standard"
  tags                = var.tags
}

resource "azurerm_nat_gateway_public_ip_association" "outbound" {
  nat_gateway_id       = azurerm_nat_gateway.outbound.id
  public_ip_address_id = azurerm_public_ip.nat_outbound_static_ip.id
}

resource "azurerm_subnet_nat_gateway_association" "outbound_webapp" {
  subnet_id      = var.subnet_webapp_id
  nat_gateway_id = azurerm_nat_gateway.outbound.id
}

resource "azurerm_subnet_nat_gateway_association" "outbound_lb" {
  subnet_id      = var.subnet_lb_id
  nat_gateway_id = azurerm_nat_gateway.outbound.id
}
