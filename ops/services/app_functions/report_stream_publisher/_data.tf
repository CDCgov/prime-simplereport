data "azurerm_storage_account" "artifact_storage" {
  name                = var.storage_account
  resource_group_name = var.rg_name
}

data "azurerm_storage_account_sas" "sas" {
  connection_string = data.azurerm_storage_account.artifact_storage.primary_connection_string
  https_only        = true
  start             = "2021-04-20"
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

data "azurerm_key_vault_secret" "report_stream_token" {
  key_vault_id = var.report_stream_key_key_vault_id
  name         = var.report_stream_key_secret_name
}

data "azurerm_function_app_host_keys" "example" {
  name                = azurerm_function_app.report_stream_publisher.name
  resource_group_name = var.rg_name
}
