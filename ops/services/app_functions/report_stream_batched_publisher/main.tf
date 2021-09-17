resource "azurerm_storage_container" "deployments" {
  name                  = "rs-batched-publisher-function-releases"
  storage_account_name  = var.storage_account_name
  container_access_type = "private"
}

resource "azurerm_storage_blob" "appcode" {
  name                   = "functionapp.zip"
  storage_account_name   = var.storage_account_name
  storage_container_name = azurerm_storage_container.deployments.name
  type                   = "Block"
  source                 = var.function_app_source
}

data "azurerm_storage_account_sas" "sas" {
  connection_string = var.storage_account_primary_connection_string
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

resource "azurerm_app_service_plan" "asp" {
  name                = "${var.prefix}-plan"
  resource_group_name = var.resource_group
  location            = var.location
  kind                = "FunctionApp"
  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}

resource "azurerm_function_app" "functions" {
  name                       = "${var.prefix}-${var.environment}"
  location                   = var.location
  resource_group_name        = var.resource_group
  app_service_plan_id        = azurerm_app_service_plan.asp.id
  storage_account_name       = var.storage_account_name
  storage_account_access_key = var.storage_account_key
  version                    = "~2"

  app_settings = {
    https_only                     = true
    FUNCTIONS_WORKER_RUNTIME       = "node"
    WEBSITE_NODE_DEFAULT_VERSION   = "~10"
    FUNCTION_APP_EDIT_MODE         = "readonly"
    HASH                           = "${base64encode(filesha256("${var.function_app_source}"))}"
    WEBSITE_RUN_FROM_PACKAGE       = "https://${var.storage_account_name}.blob.core.windows.net/${azurerm_storage_container.deployments.name}/${azurerm_storage_blob.appcode.name}${data.azurerm_storage_account_sas.sas.sas}"
    APPINSIGHTS_INSTRUMENTATIONKEY = var.app_insights_instrumentation_key
    AZ_STORAGE_QUEUE_SVC_URL       = "https://${var.storage_account_name}.queue.core.windows.net/"
    AZ_STORAGE_ACCOUNT_NAME        = var.storage_account_name
    AZ_STORAGE_ACCOUNT_KEY         = var.storage_account_key
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
