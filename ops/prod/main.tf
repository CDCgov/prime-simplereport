locals {
  project   = "prime"
  name      = "simple-report"
  env       = "prod"
  env_level = "prod"
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

resource "azurerm_cdn_profile" "cdn_profile" {
  name                = "${local.name}-${local.env}"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
  sku                 = "Standard_Microsoft"
  tags                = local.management_tags
}

resource "azurerm_cdn_endpoint" "cdn_endpoint" {
  name                          = "${local.name}-${local.env}"
  profile_name                  = azurerm_cdn_profile.cdn_profile.name
  resource_group_name           = data.azurerm_resource_group.rg.name
  location                      = data.azurerm_resource_group.rg.location
  origin_host_header            = azurerm_storage_account.app.primary_web_host
  querystring_caching_behaviour = "IgnoreQueryString"
  is_http_allowed               = false

  origin {
    name      = "${local.name}-${local.env}-static"
    host_name = azurerm_storage_account.app.primary_web_host
  }

  delivery_rule {
    name  = "bypassIndexHtmlCache"
    order = 1

    cache_expiration_action {
      behavior = "BypassCache"
    }

    url_file_name_condition {
      operator     = "Equal"
      match_values = ["index.html", "commit.txt"]
      transforms   = ["Lowercase"]
    }
  }

  delivery_rule {
    name  = "bypassMaintenanceJsonCache"
    order = 2

    cache_expiration_action {
      behavior = "BypassCache"
    }

    url_file_name_condition {
      operator     = "Equal"
      match_values = ["maintenance.json"]
      transforms   = ["Lowercase"]
    }
  }
}

module "app_gateway" {
  source                  = "../services/app_gateway"
  name                    = local.name
  env                     = local.env
  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  blob_endpoint     = azurerm_cdn_endpoint.cdn_endpoint.host_name
  subnet_id         = data.terraform_remote_state.persistent_prod.outputs.subnet_lbs_id
  key_vault_id      = data.azurerm_key_vault.global.id
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
  name                    = local.name
  env                     = local.env
  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name
  subnet_webapp_id        = data.terraform_remote_state.persistent_prod.outputs.subnet_webapp_id
  subnet_lb_id            = data.terraform_remote_state.persistent_prod.outputs.subnet_lbs_id
  subnet_vm_id            = data.terraform_remote_state.persistent_prod.outputs.subnet_vm_id
  tags                    = local.management_tags
}

module "web_application_firewall" {
  source                  = "../services/web_application_firewall"
  name                    = local.name
  env                     = local.env
  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  tags = local.management_tags
}

module "app_service_autoscale" {
  source                  = "../services/app_service_autoscale"
  name                    = local.name
  env                     = local.env
  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name
  target_resource_id      = module.simple_report_api.app_service_plan_id

  tags = local.management_tags

  peak_capacity_instances    = 4
  weekend_capacity_instances = 2
}
