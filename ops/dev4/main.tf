locals {
  project   = "prime"
  name      = "simple-report"
  env       = "dev4"
  env_level = "dev"
  management_tags = {
    prime-app   = "simple-report"
    environment = local.env
    # Resource groups can support multiple environments at the same level. Any resources that are shared between
    # environments should use the "local.env_level" convention where possible.
    resource_group = "${local.project}-${local.name}-${local.env_level}"
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
  enable_https_traffic_only = true
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

resource "azurerm_storage_queue" "fhir_data_queue" {
  name                 = "fhir-data-publishing"
  storage_account_name = azurerm_storage_account.app.name
}

resource "azurerm_storage_queue" "fhir_data_exceptions_queue" {
  name                 = "fhir-data-publishing-exceptions"
  storage_account_name = azurerm_storage_account.app.name
}

# Manually configured rules/rewrite sets
module "app_gateway" {
  source                  = "../services/app_gateway"
  name                    = "${local.name}-${local.env}"
  env                     = local.env
  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  blob_endpoint     = azurerm_storage_account.app.primary_web_host
  subnet_id         = data.terraform_remote_state.persistent_dev4.outputs.subnet_lbs_id
  key_vault_id      = data.azurerm_key_vault.sr_global.id
  log_workspace_uri = data.azurerm_log_analytics_workspace.log_analytics.id

  fqdns = [
    module.simple_report_api.app_hostname
  ]

  metabase_fqdns = [
    module.metabase_service.app_hostname
  ]

  staging_fqdns = [
    module.simple_report_api.staging_hostname
  ]

  firewall_policy_id = module.web_application_firewall.web_application_firewall_id
  tags               = local.management_tags
}

module "nat_gateway" {
  source                  = "../services/nat_gateway"
  name                    = "${local.name}-${local.env}"
  env                     = local.env
  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name
  subnet_webapp_id        = data.terraform_remote_state.persistent_dev4.outputs.subnet_webapp_id
  subnet_lb_id            = data.terraform_remote_state.persistent_dev4.outputs.subnet_lbs_id
  subnet_vm_id            = data.terraform_remote_state.persistent_dev4.outputs.subnet_vm_id
  tags                    = local.management_tags
}

module "web_application_firewall" {
  source                  = "../services/web_application_firewall"
  name                    = "${local.name}-${local.env}"
  env                     = local.env
  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  tags = local.management_tags
}

module "app_service_autoscale" {
  source                  = "../services/app_service_autoscale"
  name                    = "${local.name}-${local.env}"
  env                     = local.env
  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name
  target_resource_id      = module.simple_report_api.app_service_plan_id

  tags = local.management_tags
}
