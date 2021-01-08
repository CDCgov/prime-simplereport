resource "azurerm_app_service_plan" "service_plan" {
  name                = "${var.az_account}-appserviceplan-${var.env}"
  location            = var.resource_group_location
  resource_group_name = var.resource_group_name

  # Define Linux as Host OS
  kind     = "Linux"
  reserved = true

  sku {
    tier = var.instance_tier
    size = var.instance_size
  }
}

resource "azurerm_app_service" "service" {
  name                = "${var.name}-${var.env}"
  location            = var.resource_group_location
  resource_group_name = var.resource_group_name
  app_service_plan_id = azurerm_app_service_plan.service_plan.id

  # Configure Docker Image to load on start
  site_config {
    linux_fx_version = var.docker_image_uri
    always_on        = "true"
  }

  app_settings = merge(var.app_settings, {
    "DOCKER_REGISTRY_SERVER_PASSWORD"                = data.terraform_remote_state.global.outputs.acr_simeplereport_admin_password
    "DOCKER_REGISTRY_SERVER_URL"                     = "https://${data.terraform_remote_state.global.outputs.acr_simeplereport_name}.azurecr.io"
    "DOCKER_REGISTRY_SERVER_USERNAME"                = data.terraform_remote_state.global.outputs.acr_simeplereport_name
    "SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA" = "public"
    "WEBSITES_PORT"                                  = "8080"
    "WEBSITE_DNS_SERVER"                             = "168.63.129.16"
    "WEBSITE_VNET_ROUTE_ALL"                         = "1"
  })
  https_only = var.https_only

  identity {
    type = "SystemAssigned"
  }

  logs {
    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 30
      }
    }
  }

}

resource "azurerm_key_vault_access_policy" "app_secret_access" {
  key_vault_id = var.key_vault_id
  object_id    = azurerm_app_service.service.identity[0].principal_id
  tenant_id    = var.tenant_id

  key_permissions = [
    "get",
    "list",
  ]
  secret_permissions = [
    "get",
    "list",
  ]
}