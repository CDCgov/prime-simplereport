output "subnet_vm_id" {
  value = azurerm_subnet.vms.id
}

output "subnet_lbs_id" {
  value = azurerm_subnet.lbs.id
}

output "subnet_webapp_id" {
  value = azurerm_subnet.webapp.id
}

output "network_name" {
  value = azurerm_virtual_network.vn.name
}