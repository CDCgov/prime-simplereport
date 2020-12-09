// Setup DNS for backend Gateway
data "azurerm_dns_zone" "simple_report_org" {
  resource_group_name = data.azurerm_resource_group.rg_prod.name
  name                = "simplereport.org"
}

resource "azurerm_dns_a_record" "app_gateway" {
  name                = var.env
  zone_name           = data.azurerm_dns_zone.simple_report_org.name
  resource_group_name = data.azurerm_resource_group.rg_prod.name
  ttl                 = 60
  target_resource_id  = module.app_gateway.app_gateway_public_ip
}

resource "azurerm_dns_cname_record" "api" {
  name                = "apidev"
  zone_name           = data.azurerm_dns_zone.simple_report_org.name
  resource_group_name = data.azurerm_resource_group.rg_prod.name
  ttl                 = 60
  record              = module.simple_report_api.app_hostname
}