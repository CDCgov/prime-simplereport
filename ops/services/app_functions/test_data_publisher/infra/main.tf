locals {
  resource_group_name = "${var.resource_group_name_prefix}${var.env_level}"
  function_app_source = "${path.module}/../${var.function_app_source}"
  management_tags = {
    prime-app      = "simple-report"
    environment    = var.environment
    resource_group = local.resource_group_name
  }
}

resource "azurerm_storage_container" "deployments" {
  name                  = "test-data-publisher-function-releases"
  storage_account_name  = data.azurerm_storage_account.app.name
  container_access_type = "private"
}

// The Terraform deploy currently assumes that the .zip to be deployed already exists
resource "azurerm_storage_blob" "appcode" {
  name                   = "testdatapublisherpackage.zip"
  storage_account_name   = data.azurerm_storage_account.app.name
  storage_container_name = azurerm_storage_container.deployments.name
  type                   = "Block"
  source                 = local.function_app_source
  content_md5            = filemd5(local.function_app_source)
  content_type           = "application/zip"
}

resource "azurerm_service_plan" "asp" {
  name                = "${var.prefix}-plan-${var.environment}"
  resource_group_name = local.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "EP1"
}

resource "azurerm_key_vault_access_policy" "functions" {
  key_vault_id = data.azurerm_key_vault.sr_global.id
  tenant_id    = var.tenant_id

  object_id = azurerm_linux_function_app.functions.identity.0.principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

resource "azurerm_linux_function_app" "functions" {
  name                       = "${var.prefix}-${var.environment}"
  location                   = var.location
  resource_group_name        = local.resource_group_name
  service_plan_id            = azurerm_service_plan.asp.id
  https_only                 = true
  storage_account_name       = data.azurerm_storage_account.app.name
  storage_account_access_key = data.azurerm_storage_account.app.primary_access_key

  site_config {
    use_32_bit_worker        = false
    application_insights_key = data.azurerm_application_insights.app.instrumentation_key

    ip_restriction_default_action     = "Deny" # Should use behavior set in the ip_restriction
    scm_ip_restriction_default_action = "Deny" # We don't use Kudu or the SCM site tools
    // NOTE: If this code is removed, TF will not automatically delete it with the current provider version! It must be removed manually from the App Service -> Networking blade!
    ip_restriction {
      virtual_network_subnet_id = var.lb_subnet_id
      action                    = "Allow"
    }
    application_stack {
      node_version = "20"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    https_only                            = true
    FUNCTIONS_WORKER_RUNTIME              = "node"
    WEBSITE_NODE_DEFAULT_VERSION          = "~20"
    FUNCTION_APP_EDIT_MODE                = "readonly"
    HASH                                  = azurerm_storage_blob.appcode.content_md5
    WEBSITE_RUN_FROM_PACKAGE              = "https://${data.azurerm_storage_account.app.name}.blob.core.windows.net/${azurerm_storage_container.deployments.name}/${azurerm_storage_blob.appcode.name}${data.azurerm_storage_account_sas.sas.sas}"
    APPLICATIONINSIGHTS_CONNECTION_STRING = data.azurerm_application_insights.app.connection_string
    AZ_STORAGE_QUEUE_SVC_URL              = "https://${data.azurerm_storage_account.app.name}.queue.core.windows.net/"
    AZ_STORAGE_ACCOUNT_NAME               = data.azurerm_storage_account.app.name
    AZ_STORAGE_ACCOUNT_KEY                = data.azurerm_storage_account.app.primary_access_key
    AZ_STORAGE_QUEUE_CXN_STRING           = data.azurerm_storage_account.app.primary_connection_string
    AIMS_ACCESS_KEY_ID                    = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.aims_access_key_id.id})"
    AIMS_SECRET_ACCESS_KEY                = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.aims_secret_access_key.id})"
    AIMS_KMS_ENCRYPTION_KEY               = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.aims_kms_encryption_key.id})"
    AIMS_OUTBOUND_ENDPOINT                = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.aims_outbound_storage_endpoint.id})"
    AIMS_USER_ID                          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.aims_user_id.id})"
    AIMS_ENVIRONMENT                      = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.aims_environment.id})"
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
    replace_triggered_by = [
      azurerm_service_plan.asp
    ]
  }
}
