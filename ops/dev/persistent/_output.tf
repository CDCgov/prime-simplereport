output "subnet_dev_vm_id" {
  value = azurerm_subnet.vms.id
}

output "subnet_lbs_id" {
  value = azurerm_subnet.lbs.id
}