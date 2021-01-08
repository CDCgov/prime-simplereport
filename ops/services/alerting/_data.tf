data "azurerm_client_config" "current" {}

data "azurerm_storage_account" "global" {
  name                = var.storage_account
  resource_group_name = "prime-simple-report-test" # TF state has not yet been migrated to the global RG
}

data "azurerm_storage_account_sas" "sas" {
  connection_string = data.azurerm_storage_account.global.primary_connection_string
  https_only        = true
  start             = "2021-01-01"
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

data "azurerm_key_vault_secret" "slack_webhook" {
  key_vault_id = var.key_vault_id
  name         = "simple-report-global-slack-webhook"
}
