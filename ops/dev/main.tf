locals {
  project = "prime"
  name    = "simple-report"
  management_tags = {
    prime-app      = "simple-report"
    environment    = var.env
    resource_group = "${local.project}-${local.name}-${var.env}"
  }
}

module "all" {
  source     = "../services/all-ephemeral"
  docker_tag = var.docker_tag
  env        = var.env
}

module "simple_report_api" {
  source = "../services/app_service"
  name   = "${local.name}-api"
  env    = var.env

  instance_tier = "Standard"
  instance_size = "S1"

  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  docker_image_uri = "DOCKER|simplereportacr.azurecr.io/api/simple-report-api-build:7022210" # hardcoding this until automated deploy of images are in place
  key_vault_id     = data.azurerm_key_vault.sr_global.id
  tenant_id        = data.azurerm_client_config.current.tenant_id

  app_settings = {
    "DOCKER_REGISTRY_SERVER_PASSWORD"                = data.terraform_remote_state.global.outputs.acr_simeplereport_admin_password
    "DOCKER_REGISTRY_SERVER_URL"                     = "https://${data.terraform_remote_state.global.outputs.acr_simeplereport_name}.azurecr.io"
    "DOCKER_REGISTRY_SERVER_USERNAME"                = data.terraform_remote_state.global.outputs.acr_simeplereport_name
    "SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA" = "public"
    "WEBSITES_PORT"                                  = "8080"
    SPRING_PROFILES_ACTIVE                           = "azure-dev,no-security"
    SPRING_LIQUIBASE_ENABLED                         = "true"
    SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA   = "public"
    SPRING_DATASOURCE_URL                            = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.sr_dev_db_jdbc.id})"
    OKTA_OAUTH2_CLIENT_ID                            = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.okta_client_id.id})"
    OKTA_OAUTH2_CLIENT_SECRET                        = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.okta_client_secret.id})"
    OKTA_OAUTH2_ISSUER                               = "https://hhs-prime.okta.com/oauth2/default"
  }
}


module "bastion" {
  source = "../services/bastion_host"
  env    = var.env

  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  virtual_network_name = "${local.name}-${var.env}-network"
  subnet_cidr          = ["10.1.253.0/27"]

  tags = local.management_tags
}

module "psql_connect" {
  source                  = "../services/basic_vm"
  name                    = "psql-connect"
  env                     = var.env
  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  subnet_id                = data.terraform_remote_state.persistent_dev.outputs.subnet_dev_vm_id
  bastion_connect_password = data.azurerm_key_vault_secret.psql_connect_password_dev.value

  tags = local.management_tags
}

# Manually added custom DNS
module "app_gateway" {
  source                  = "../services/app_gateway"
  name                    = local.name
  env                     = var.env
  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  subnet_id = data.terraform_remote_state.persistent_dev.outputs.subnet_lbs_id

  fqdns = [
    module.simple_report_api.app_hostname
  ]

  tags = local.management_tags
}

# Frontend React App
resource "azurerm_storage_account" "app" {
  account_replication_type  = "GRS" # Cross-regional redundancy
  account_tier              = "Standard"
  account_kind              = "StorageV2"
  name                      = "simplereport${var.env}app"
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
  name                = "${local.name}-${var.env}"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
  sku                 = "Standard_Microsoft"
  tags                = local.management_tags
}

# Custom DNS for CDN was manually added due to provider speed of development
# https://github.com/terraform-providers/terraform-provider-azurerm/issues/398
resource "azurerm_cdn_endpoint" "cdn_endpoint" {
  name                          = "${local.name}-${var.env}"
  profile_name                  = azurerm_cdn_profile.cdn_profile.name
  resource_group_name           = data.azurerm_resource_group.rg.name
  location                      = data.azurerm_resource_group.rg.location
  origin_host_header            = azurerm_storage_account.app.primary_web_host
  querystring_caching_behaviour = "IgnoreQueryString"

  origin {
    name      = "${local.name}-${var.env}-static"
    host_name = azurerm_storage_account.app.primary_web_host
  }
}
