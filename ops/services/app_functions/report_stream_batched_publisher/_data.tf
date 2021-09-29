locals {
  report_stream_token_secret_name = var.environment == "prod" ? "prod" : "test"
}

data "azurerm_resource_group" "rg_global" {
  name = "prime-simple-report-management"
}
data "azurerm_key_vault" "sr_global" {
  name                = "simple-report-global"
  resource_group_name = data.azurerm_resource_group.rg_global.name
}

data "azurerm_key_vault_secret" "datahub_api_key" {
  name         = "datahub-api-key-${local.report_stream_token_secret_name}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_application_insights" "app" {
  name                = "prime-simple-report-${var.environment}-insights"
  resource_group_name = local.resource_group_name
}

data "azurerm_storage_account" "app" {
  name                = "simplereport${var.environment}app"
  resource_group_name = local.resource_group_name
}

data "azurerm_storage_account_sas" "sas" {
  connection_string = data.azurerm_storage_account.app.primary_connection_string
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
