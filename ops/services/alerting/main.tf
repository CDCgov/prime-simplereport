# Create an action group to handle alerts
locals {
  admins        = split("\n", file("${path.module}/admins.txt"))
  function_code = "${path.module}/functions/build/alertrouter.zip"
}

resource "azurerm_monitor_action_group" "admins" {
  name                = "prime-simple-report-global-admins"
  resource_group_name = var.rg_name
  short_name          = "SR Admins"
}

resource "azurerm_app_service_plan" "alerts-plan" {
  location            = var.rg_location
  name                = "alerts-appservice-plan"
  resource_group_name = var.rg_name
  kind                = "FunctionApp"
  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}


# Create the azure function
resource "azurerm_function_app" "alerts" {
  app_service_plan_id        = azurerm_app_service_plan.alerts-plan.id
  location                   = var.rg_location
  name                       = "prime-simple-report-error-manager"
  resource_group_name        = var.rg_name
  version                    = "~3"
  storage_account_name       = data.azurerm_storage_account.global.name
  storage_account_access_key = data.azurerm_storage_account.global.primary_access_key

  app_settings = {
    https_only                            = true
    APPINSIGHTS_INSTRUMENTATIONKEY        = "ad816943-bac3-4910-a49d-6dba7b3e1a5f"
    APPLICATIONINSIGHTS_CONNECTION_STRING = "InstrumentationKey=ad816943-bac3-4910-a49d-6dba7b3e1a5f;IngestionEndpoint=https://eastus-0.in.applicationinsights.azure.com/"
    FUNCTIONS_WORKER_RUNTIME              = "node"
    WEBSITE_NODE_DEFAULT_VERSION          = "~12"
    HASH                                  = base64encode(filesha256(local.function_code))
    WEBSITE_RUN_FROM_PACKAGE              = "https://${data.azurerm_storage_account.global.name}.blob.core.windows.net/${azurerm_storage_container.alerts.name}/${azurerm_storage_blob.alertscode.name}${data.azurerm_storage_account_sas.sas.sas}"
  }
}
