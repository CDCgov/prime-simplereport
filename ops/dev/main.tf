locals {
  management_tags = {
    prime-app      = "simple-report"
    environment    = var.env
    resource_group = "${var.application_name}-${var.env}"
  }
}

module "all" {
  source     = "../services/all-ephemeral"
  docker_tag = var.docker_tag
  env        = var.env
}

module "simple_report_api" {
  source = "../services/app_service"
  name   = "simple-report-api"
  env    = var.env

  instance_tier = "Standard"
  instance_size = "S1"

  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  docker_image_uri = "DOCKER|simplereportacr.azurecr.io/api/simple-report-api-build:c2514f6" # hardcoding this until automated deploy of images are in place

  app_settings = {
    "DOCKER_REGISTRY_SERVER_PASSWORD"                = data.terraform_remote_state.global.outputs.acr_simeplereport_admin_password
    "DOCKER_REGISTRY_SERVER_URL"                     = "https://${data.terraform_remote_state.global.outputs.acr_simeplereport_name}.azurecr.io"
    "DOCKER_REGISTRY_SERVER_USERNAME"                = data.terraform_remote_state.global.outputs.acr_simeplereport_name
    "SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA" = "public"
    "WEBSITES_PORT"                                  = "8080"
    SPRING_PROFILES_ACTIVE                           = "azure-dev"
    SPRING_LIQUIBASE_ENABLED                         = "true"
    SPRING_DATASOURCE_URL                            = data.azurerm_key_vault_secret.sr_dev_db_jdbc.value
  }
}


module "bastion" {
  source = "../services/bastion_host"
  env    = var.env

  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  virtual_network_name = "simple-report-dev-network"
  subnet_cidr          = ["10.1.253.0/27"]

  tags = local.management_tags
}