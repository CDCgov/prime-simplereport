locals {
  simple_report_callback_url = "https://${var.environment == "prod" ? "www" : var.environment}.simplereport.gov/api/reportstream/callback"
  resource_group_name        = "${var.resource_group_name_prefix}${var.env_level}"
  report_stream_url          = "https://${var.environment == "prod" ? "" : "staging."}prime.cdc.gov/api/reports?option=SkipInvalidItems"
  function_app_source        = "${path.module}/../${var.function_app_source}"
  management_tags = {
    prime-app      = "simple-report"
    environment    = var.environment
    resource_group = local.resource_group_name
  }
}

resource "azurerm_storage_container" "deployments" {
  name                  = "rs-batched-publisher-function-releases"
  storage_account_name  = data.azurerm_storage_account.app.name
  container_access_type = "private"
}

// The Terraform deploy currently assumes that the .zip to be deployed already exists
resource "azurerm_storage_blob" "appcode" {
  name                   = "functionapp.zip"
  storage_account_name   = data.azurerm_storage_account.app.name
  storage_container_name = azurerm_storage_container.deployments.name
  type                   = "Block"
  source                 = local.function_app_source
  content_md5            = filemd5(local.function_app_source)
  content_type           = "application/zip"
}

resource "azurerm_app_service_plan" "asp" {
  name                = "${var.prefix}-plan-${var.environment}"
  resource_group_name = local.resource_group_name
  location            = var.location
  kind                = "elastic"
  reserved            = true
  sku {
    tier = "ElasticPremium"
    size = "EP1"
  }
}

resource "azurerm_key_vault_access_policy" "functions" {
  key_vault_id = data.azurerm_key_vault.sr_global.id
  tenant_id    = var.tenant_id

  object_id = azurerm_function_app.functions.identity.0.principal_id

  secret_permissions = [
    "get",
    "list"
  ]
}

resource "azurerm_function_app" "functions" {
  name                       = "${var.prefix}-${var.environment}"
  location                   = var.location
  resource_group_name        = local.resource_group_name
  app_service_plan_id        = azurerm_app_service_plan.asp.id
  storage_account_name       = data.azurerm_storage_account.app.name
  storage_account_access_key = data.azurerm_storage_account.app.primary_access_key
  https_only                 = true
  version                    = "~4"
  os_type                    = "linux"
  site_config {
    linux_fx_version          = "node|14"
    use_32_bit_worker_process = false

    elastic_instance_minimum = 1

    // NOTE: If this code is removed, TF will not automatically delete it with the current provider version! It must be removed manually from the App Service -> Networking blade!
    ip_restriction {
      virtual_network_subnet_id = var.lb_subnet_id
      action                    = "Allow"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    https_only                     = true
    FUNCTIONS_WORKER_RUNTIME       = "node"
    WEBSITE_NODE_DEFAULT_VERSION   = "~14"
    FUNCTION_APP_EDIT_MODE         = "readonly"
    HASH                           = azurerm_storage_blob.appcode.content_md5
    WEBSITE_RUN_FROM_PACKAGE       = "https://${data.azurerm_storage_account.app.name}.blob.core.windows.net/${azurerm_storage_container.deployments.name}/${azurerm_storage_blob.appcode.name}${data.azurerm_storage_account_sas.sas.sas}"
    APPINSIGHTS_INSTRUMENTATIONKEY = data.azurerm_application_insights.app.instrumentation_key
    AZ_STORAGE_QUEUE_SVC_URL       = "https://${data.azurerm_storage_account.app.name}.queue.core.windows.net/"
    AZ_STORAGE_ACCOUNT_NAME        = data.azurerm_storage_account.app.name
    AZ_STORAGE_ACCOUNT_KEY         = data.azurerm_storage_account.app.primary_access_key
    AZ_STORAGE_QUEUE_CXN_STRING    = data.azurerm_storage_account.app.primary_connection_string
    TEST_EVENT_QUEUE_NAME          = var.test_event_queue_name
    REPORTING_EXCEPTION_QUEUE_NAME = var.reporting_exception_queue_name
    REPORT_STREAM_URL              = local.report_stream_url
    REPORT_STREAM_TOKEN            = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.datahub_api_key.id})"
    REPORT_STREAM_BATCH_MINIMUM    = var.report_stream_batch_minimum
    REPORT_STREAM_BATCH_MAXIMUM    = var.report_stream_batch_maximum
    SIMPLE_REPORT_CB_URL           = local.simple_report_callback_url
    SIMPLE_REPORT_CB_TOKEN         = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.simple_report_callback_token.id})"
  }
}

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 2.92.0"
    }
  }
  required_version = "~> 1.3.3"
}
