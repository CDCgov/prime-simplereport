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

  app_settings = var.app_settings
}