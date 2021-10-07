locals {
  project = "prime"
  name    = "simple-report"
  env     = "test"
  management_tags = {
    prime-app      = "simple-report"
    environment    = local.env
    resource_group = "${local.project}-${local.name}-${local.env}"
  }
}

# Frontend React App
resource "azurerm_storage_account" "app" {
  account_replication_type  = "GRS" # Cross-regional redundancy
  account_tier              = "Standard"
  account_kind              = "StorageV2"
  name                      = "simplereport${local.env}app"
  resource_group_name       = data.azurerm_resource_group.rg.name
  location                  = data.azurerm_resource_group.rg.location
  enable_https_traffic_only = false
  min_tls_version           = "TLS1_2"

  static_website {
    index_document     = "index.html"
    error_404_document = "404.html"
  }
  tags = local.management_tags
}

resource "azurerm_storage_queue" "test_event_queue" {
  name                 = "test-event-publishing"
  storage_account_name = azurerm_storage_account.app.name
}

resource "azurerm_storage_queue" "test_event_exceptions_queue" {
  name                 = "test-event-publishing-exceptions"
  storage_account_name = azurerm_storage_account.app.name
}

# Manually configured rules/rewrite sets
module "app_gateway" {
  source                  = "../services/app_gateway"
  name                    = local.name
  env                     = local.env
  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  blob_endpoint     = azurerm_storage_account.app.primary_web_host
  subnet_id         = data.terraform_remote_state.persistent_test.outputs.subnet_lbs_id
  key_vault_id      = data.azurerm_key_vault.sr_global.id
  log_workspace_uri = data.azurerm_log_analytics_workspace.log_analytics.id

  fqdns = [
    module.simple_report_api.app_hostname
  ]

  tags = local.management_tags
}
