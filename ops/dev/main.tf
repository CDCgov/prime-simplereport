locals {
  name = "simple-report"
  management_tags = {
    prime-app      = "simple-report"
    environment    = var.env
    resource_group = "${var.application_name}-${var.env}"
  }
}

# VMs subnet
resource "azurerm_subnet" "vms" {
  name                 = "${var.env}-vms"
  resource_group_name  = data.azurerm_resource_group.rg.name
  virtual_network_name = data.azurerm_virtual_network.dev.name
  address_prefixes     = ["10.1.252.0/24"]
}

resource "azurerm_subnet" "load_balancers" {
  name                 = "${var.env}-load-balancers"
  resource_group_name  = data.azurerm_resource_group.rg.name
  virtual_network_name = data.azurerm_virtual_network.dev.name
  address_prefixes     = ["10.1.254.0/24"]
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

  docker_image_uri = "DOCKER|simplereportacr.azurecr.io/api/simple-report-api-build:c2514f6" # hardcoding this until automated deploy of images are in place
  key_vault_id     = data.azurerm_key_vault.sr_global.id
  tenant_id        = data.azurerm_client_config.current.tenant_id

  app_settings = {
    "DOCKER_REGISTRY_SERVER_PASSWORD"                = data.terraform_remote_state.global.outputs.acr_simeplereport_admin_password
    "DOCKER_REGISTRY_SERVER_URL"                     = "https://${data.terraform_remote_state.global.outputs.acr_simeplereport_name}.azurecr.io"
    "DOCKER_REGISTRY_SERVER_USERNAME"                = data.terraform_remote_state.global.outputs.acr_simeplereport_name
    "SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA" = "public"
    "WEBSITES_PORT"                                  = "8080"
    SPRING_PROFILES_ACTIVE                           = "azure-dev"
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

  subnet_id                = azurerm_subnet.vms.id
  bastion_connect_password = data.azurerm_key_vault_secret.psql_connect_password_dev.value

  tags = local.management_tags
}

resource "azurerm_public_ip" "static_gateway" {
  name                = "${local.name}-gateway"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = local.management_tags
}

resource "azurerm_application_gateway" "load_balancer" {
  name                = "${local.name}-app-gateway"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location

  sku {
    name = "Standard_v2"
    tier = "Standard_v2"
  }

  gateway_ip_configuration {
    name      = "${local.name}-${var.env}-gateway-ip-config"
    subnet_id = azurerm_subnet.load_balancers.id
  }

  frontend_port {
    name = "${local.name}-fe-port"
    port = 80
  }

  frontend_ip_configuration {
    name                 = "${local.name}-fe-ip-config"
    public_ip_address_id = azurerm_public_ip.static_gateway.id
  }

  backend_address_pool {
    name = "${local.name}-be-pool"
    fqdns = [
      module.simple_report_api.app_hostname
    ]
  }

  backend_http_settings {
    name                                = "${local.name}-be-config"
    cookie_based_affinity               = "Disabled"
    port                                = 80
    protocol                            = "Http"
    request_timeout                     = 20
    pick_host_name_from_backend_address = true
  }

  http_listener {
    name                           = "${local.name}-api"
    frontend_ip_configuration_name = "${local.name}-fe-ip-config"
    frontend_port_name             = "${local.name}-fe-port"
    protocol                       = "Http"
  }

  request_routing_rule {
    name                       = "${local.name}-routing-1"
    rule_type                  = "Basic"
    http_listener_name         = "${local.name}-api"
    backend_address_pool_name  = "${local.name}-be-pool"
    backend_http_settings_name = "${local.name}-be-config"
  }

  autoscale_configuration {
    min_capacity = 0
    max_capacity = 4
  }

  depends_on = [
    azurerm_public_ip.static_gateway
  ]

  tags = local.management_tags
}

# Frontend React App
resource "azurerm_storage_account" "app" {
  account_replication_type  = "GRS" # Cross-regional redundancy
  account_tier              = "Standard"
  account_kind              = "StorageV2"
  name                      = "simplereportapp${var.env}"
  resource_group_name       = data.azurerm_resource_group.rg.name
  location                  = data.azurerm_resource_group.rg.location
  enable_https_traffic_only = true
  min_tls_version           = "TLS1_2"

  static_website {
    index_document = "index.html"
  }
  tags = local.management_tags
}
