locals {
  project = "prime"
  name    = "simple-report"
  env     = "dev"
  management_tags = {
    prime-app      = "simple-report"
    environment    = var.env
    resource_group = "${local.project}-${local.name}-${var.env}"
  }
}

module "simple_report_api" {
  source = "../services/app_service"
  name   = "${local.name}-api"
  env    = var.env

  instance_tier = "Standard"
  instance_size = "S1"

  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  docker_image_uri = "DOCKER|simplereportacr.azurecr.io/api/simple-report-api-build:${var.acr_image_tag}"
  key_vault_id     = data.azurerm_key_vault.sr_global.id
  tenant_id        = data.azurerm_client_config.current.tenant_id

  app_settings = {
    "DOCKER_REGISTRY_SERVER_PASSWORD"                = data.terraform_remote_state.global.outputs.acr_simeplereport_admin_password
    "DOCKER_REGISTRY_SERVER_URL"                     = "https://${data.terraform_remote_state.global.outputs.acr_simeplereport_name}.azurecr.io"
    "DOCKER_REGISTRY_SERVER_USERNAME"                = data.terraform_remote_state.global.outputs.acr_simeplereport_name
    "SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA" = "public"
    "WEBSITES_PORT"                                  = "8080"
    "WEBSITE_DNS_SERVER"                             = "168.63.129.16"
    "WEBSITE_VNET_ROUTE_ALL"                         = "1"
    SPRING_PROFILES_ACTIVE                           = "azure-dev,no-security"
    SPRING_LIQUIBASE_ENABLED                         = "true"
    SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA   = "public"
    SPRING_DATASOURCE_URL                            = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.sr_dev_db_jdbc.id})"
    DATAHUB_API_KEY                                  = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.datahub_api_key.id})"
    APPLICATIONINSIGHTS_CONNECTION_STRING            = "InstrumentationKey=${data.azurerm_application_insights.app_insights.instrumentation_key};IngestionEndpoint=https://eastus-1.in.applicationinsights.azure.com/"
    SECRET_SLACK_NOTIFY_WEBHOOK_URL                  = ""
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
    index_document = "index.html"
  }
  tags = local.management_tags
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

  origin {
    name      = "${local.name}-${local.env}-static"
    host_name = azurerm_storage_account.app.primary_web_host
  }
}


# Manually configured rules/rewrite sets
module "app_gateway" {
  source                  = "../services/app_gateway"
  name                    = local.name
  env                     = local.env
  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  cdn_hostname      = azurerm_cdn_endpoint.cdn_endpoint.host_name
  subnet_id         = data.terraform_remote_state.persistent_dev.outputs.subnet_lbs_id
  key_vault_id      = data.azurerm_key_vault.sr_global.id
  log_workspace_uri = data.azurerm_log_analytics_workspace.log_analytics.id

  fqdns = [
    module.simple_report_api.app_hostname
  ]

  tags = local.management_tags
}
