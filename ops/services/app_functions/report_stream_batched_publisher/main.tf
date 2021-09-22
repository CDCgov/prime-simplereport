locals {
  resource_group_name = "${var.resource_group_name_prefix}${var.environment}"
  management_tags = {
    prime-app      = "simple-report"
    environment    = var.environment
    resource_group = local.resource_group_name
  }
}

resource "azurerm_storage_account" "fn_app" {
  account_replication_type  = "GRS" # Cross-regional redundancy
  account_tier              = "Standard"
  account_kind              = "StorageV2"
  name                      = "simplereport${var.environment}rspubfn"
  resource_group_name       = local.resource_group_name
  location                  = var.location
  enable_https_traffic_only = false
  min_tls_version           = "TLS1_2"
  tags                      = local.management_tags
}

resource "azurerm_storage_queue" "test_event_queue" {
  name                 = "test-event-publishing"
  storage_account_name = azurerm_storage_account.fn_app.name
}

resource "azurerm_storage_container" "deployments" {
  name                  = "rs-batched-publisher-function-releases"
  storage_account_name  = azurerm_storage_account.fn_app.name
  container_access_type = "private"
}

resource "azurerm_storage_blob" "appcode" {
  name                   = "functionapp.zip"
  storage_account_name   = azurerm_storage_account.fn_app.name
  storage_container_name = azurerm_storage_container.deployments.name
  type                   = "Block"
  source                 = var.function_app_source
}

resource "azurerm_app_service_plan" "asp" {
  name                = "${var.prefix}-plan"
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
  storage_account_name       = azurerm_storage_account.fn_app.name
  storage_account_access_key = azurerm_storage_account.fn_app.primary_access_key
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
    WEBSITE_RUN_FROM_PACKAGE       = "https://${azurerm_storage_account.fn_app.name}.blob.core.windows.net/${azurerm_storage_container.deployments.name}/${azurerm_storage_blob.appcode.name}${data.azurerm_storage_account_sas.sas.sas}"
    APPINSIGHTS_INSTRUMENTATIONKEY = var.app_insights_instrumentation_key
    AZ_STORAGE_QUEUE_SVC_URL       = "https://${data.azurerm_storage_account.app.name}.queue.core.windows.net/"
    AZ_STORAGE_ACCOUNT_NAME        = data.azurerm_storage_account.app.name
    AZ_STORAGE_ACCOUNT_KEY         = data.azurerm_storage_account.app.primary_access_key
    TEST_EVENT_QUEUE_NAME          = var.test_event_queue_name
    REPORT_STREAM_URL              = var.report_stream_url
    REPORT_STREAM_TOKEN            = var.report_stream_token
    REPORT_STREAM_BATCH_MINIMUM    = "1"
    REPORT_STREAM_BATCH_MAXIMUM    = "1000"
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}
