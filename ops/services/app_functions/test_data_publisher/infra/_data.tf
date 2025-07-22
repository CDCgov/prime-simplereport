locals {
  token_env_suffix = (var.environment == "prod" || var.environment == "stg") ? "prod" : "test"
}

data "azurerm_resource_group" "rg_global" {
  name = "prime-simple-report-management"
}
data "azurerm_key_vault" "sr_global" {
  name                = "simple-report-global"
  resource_group_name = data.azurerm_resource_group.rg_global.name
}

data "azurerm_key_vault_secret" "aims_access_key_id" {
  name         = "aims-access-key-id-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "aims_secret_access_key" {
  name         = "aims-secret-access-key-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "aims_kms_encryption_key" {
  name         = "aims-kms-encryption-key-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "aims_outbound_storage_endpoint" {
  name         = "aims-outbound-storage-endpoint-${local.token_env_suffix}"
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
  start             = formatdate("YYYY-MM-DD", timeadd(timestamp(), "-24h"))
  expiry            = formatdate("YYYY-MM-DD", timeadd(timestamp(), "2880h"))
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
    tag     = false
    filter  = false
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
