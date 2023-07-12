output "subnet_lbs_id" {
  value = azurerm_subnet.lbs.id
}

output "subnet_webapp_id" {
  value = azurerm_subnet.webapp.id
}

output "subnet_db_id" {
  value = azurerm_subnet.db.id
}

output "subnet_container_instances_id" {
  value = azurerm_subnet.container_instances.id
}

output "private_dns_zone_id" {
  value = azurerm_private_dns_zone.default.id
}

output "network" {
  value = azurerm_virtual_network.vn
}
