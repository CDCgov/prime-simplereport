resource "azurerm_network_interface" "psql_connect" {
  name                = var.name
  location            = var.resource_group_location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "psql-connect"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_virtual_machine" "psql_connect" {
  name                  = "psql-connect"
  location              = var.resource_group_location
  resource_group_name   = var.resource_group_name
  network_interface_ids = [azurerm_network_interface.psql_connect.id]
  vm_size               = "Standard_A1_v2"

  delete_os_disk_on_termination    = true
  delete_data_disks_on_termination = true

  storage_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }

  storage_os_disk {
    name              = "psql-connect"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }

  os_profile {
    computer_name  = "psql-connect"
    admin_username = "psql-connect"
    admin_password = data.azurerm_key_vault_secret.psql_connect_password_dev.value
  }

  os_profile_linux_config {
    disable_password_authentication = false
  }

  tags = local.management_tags
}