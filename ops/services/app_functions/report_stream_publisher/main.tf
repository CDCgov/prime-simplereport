data "archive_file" "function_artifact" {
  output_path = "${path.module}/dist.zip"
  type        = "zip"

  dynamic "source" {
    for_each = [
      for toInclude in fileset("${path.module}/functions", "**") :
      toInclude if length(regexall("^node_modules/", toInclude)) == 0 && length(regexall("^coverage/", toInclude)) == 0 && length(regexall("\\.test\\.js$", toInclude)) == 0 && length(regexall("/__mocks__/", toInclude)) == 0 && length(regexall("^package-lock\\.json$", toInclude)) == 0
    ]

    content {
      filename = source.value
      content  = file("${path.module}/functions/${source.value}")
    }
  }

  source {
    filename = "SingleTestEventPublisher/function.json"
    content = jsonencode({
      disabled = !var.enabled
      bindings = [
        {
          type       = "queueTrigger"
          direction  = "in"
          name       = "SingleTestEventPublisher"
          queueName  = var.queue_name
          connection = var.queue_connection_string
        }
      ]
    })
  }
}

# Create release package in the storage account
resource "azurerm_storage_container" "report_stream_publisher" {
  name                  = "report-stream-publisher-releases"
  storage_account_name  = var.storage_account
  container_access_type = "private"
}

resource "azurerm_storage_blob" "report_stream_publisher_artifact" {
  name                   = "reportstreampublisher.zip"
  storage_account_name   = var.storage_account
  storage_container_name = azurerm_storage_container.report_stream_publisher.name
  type                   = "Block"
  source                 = data.archive_file.function_artifact.output_path
  content_md5            = data.archive_file.function_artifact.output_md5
}

resource "azurerm_app_service_plan" "publisher_plan" {
  location            = var.rg_location
  name                = "publisher-appservice-plan"
  resource_group_name = var.rg_name
  kind                = "FunctionApp"

  sku {
    size = "Dynamic"
    tier = "Y1"
  }
}

resource "azurerm_function_app" "report_stream_publisher" {
  app_service_plan_id = azurerm_app_service_plan.publisher_plan.id
  location            = var.rg_location
  name                = "report-stream-publisher"
  resource_group_name = var.rg_name

  app_settings = {
    APPINSIGHTS_INSTRUMENTATIONKEY        = var.app_insights_key
    APPLICATIONINSIGHTS_CONNECTION_STRING = var.app_insights_connection_string
    FUNCTIONS_WORKER_RUNTIME              = "node"
    WEBSITE_NODE_DEFAULT_VERSION          = "~14"
    WEBSITE_RUN_FROM_PACKAGE              = "https://${data.azurerm_storage_account.artifact_storage.name}.blob.core.windows.net/${azurerm_storage_container.report_stream_publisher.name}/${azurerm_storage_blob.report_stream_publisher_artifact.name}${data.azurerm_storage_account_sas.sas.sas}"
    HASH                                  = data.archive_file.function_artifact.output_base64sha256
    REPORT_STREAM_TOKEN                   = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.report_stream_token.id})"
    REPORT_STREAM_URL                     = var.report_stream_upload_url
  }
}

# Send logs to Log Analytics workspace
resource "azurerm_monitor_diagnostic_setting" "logs" {
  name                       = "FunctionAppLogs"
  target_resource_id         = azurerm_function_app.report_stream_publisher.id
  log_analytics_workspace_id = var.log_workspace_id

  log {
    category = "FunctionAppLogs"
    enabled  = true
    retention_policy {
      days    = 60
      enabled = true
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      days    = 30
      enabled = true
    }
  }
}
