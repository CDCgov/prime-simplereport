locals {
  resource_group_name = "${var.resource_group_name_prefix}${var.environment}"
  report_stream_url   = "https://${var.environment == "prod" ? "" : "staging."}prime.cdc.gov/api/reports?option=SkipInvalidItems&verbose=true"
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

resource "azurerm_storage_blob" "appcode" {
  name                   = "functionapp.zip"
  storage_account_name   = data.azurerm_storage_account.app.name
  storage_container_name = azurerm_storage_container.deployments.name
  type                   = "Block"
  source                 = var.function_app_source
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

resource "azurerm_function_app" "functions" {
  name                       = "${var.prefix}-${var.environment}"
  location                   = var.location
  resource_group_name        = local.resource_group_name
  app_service_plan_id        = azurerm_app_service_plan.asp.id
  storage_account_name       = data.azurerm_storage_account.app.name
  storage_account_access_key = data.azurerm_storage_account.app.primary_access_key
  https_only                 = true
  version                    = "~3"
  os_type                    = "linux"
  site_config {
    linux_fx_version          = "node|14"
    use_32_bit_worker_process = false
  }

  app_settings = {
    https_only                     = true
    FUNCTIONS_WORKER_RUNTIME       = "node"
    WEBSITE_NODE_DEFAULT_VERSION   = "~14"
    FUNCTION_APP_EDIT_MODE         = "readonly"
    HASH                           = "${base64encode(filesha256("${var.function_app_source}"))}"
    WEBSITE_RUN_FROM_PACKAGE       = "https://${data.azurerm_storage_account.app.name}.blob.core.windows.net/${azurerm_storage_container.deployments.name}/${azurerm_storage_blob.appcode.name}${data.azurerm_storage_account_sas.sas.sas}"
    APPINSIGHTS_INSTRUMENTATIONKEY = data.azurerm_application_insights.app.instrumentation_key
    AZ_STORAGE_QUEUE_SVC_URL       = "https://${data.azurerm_storage_account.app.name}.queue.core.windows.net/"
    AZ_STORAGE_ACCOUNT_NAME        = data.azurerm_storage_account.app.name
    AZ_STORAGE_ACCOUNT_KEY         = data.azurerm_storage_account.app.primary_access_key
    TEST_EVENT_QUEUE_NAME          = var.test_event_queue_name
    REPORTING_EXCEPTION_QUEUE_NAME = var.reporting_exception_queue_name
    REPORT_STREAM_URL              = local.report_stream_url
    ### TODO: Figure out the KeyVault permissioning issue that prevents this reference from working
    # REPORT_STREAM_TOKEN            = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.datahub_api_key.id})"
    REPORT_STREAM_TOKEN         = var.report_stream_api_token
    REPORT_STREAM_BATCH_MINIMUM = "1"
    REPORT_STREAM_BATCH_MAXIMUM = "5000"
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}
