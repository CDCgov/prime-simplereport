data "azurerm_storage_account" "app" {
  name = "simplereport${var.environment}app"
  resource_group_name = local.resource_group_name
}

data "azurerm_storage_account_sas" "sas" {
  connection_string = azurerm_storage_account.fn_app.primary_connection_string
  https_only        = true
  start             = "2021-09-01"
  expiry            = "2022-12-31"
  resource_types {
    object    = true
    container = false
    service   = false
  }
  services {
    blob  = true
    queue = false
    table = false
    file  = false
  }
  permissions {
    read    = true
    write   = false
    delete  = false
    list    = false
    add     = false
    create  = false
    update  = false
    process = false
  }
}
