resource "azurerm_container_group" "db_client" {
  name                = "${var.name}-${var.env}-db-client"
  location            = var.resource_group_location
  resource_group_name = var.resource_group_name
  ip_address_type     = "Private"
  subnet_ids          = [var.subnet_id]
  os_type             = "Linux"
  restart_policy      = "Always"

  image_registry_credential {
    username = var.acr_username
    password = var.acr_password
    server   = var.acr_server
  }

  container {
    name   = "${var.name}-${var.env}-db-client"
    image  = "${var.acr_server}/api/simple-report-db-client:${var.acr_image_tag}"
    cpu    = "1"
    memory = "1.5"

    // Not a real port but *a* port is required, so expose a port the container hopefully doesn't respond to
    ports {
      port     = 1234
      protocol = "TCP"
    }

    environment_variables = {
      //LIQUIBASE_ROLLBACK_TAG = var.rollback_tag
      //LIQUIBASE_ACTION       = var.image_action
    }

    secure_environment_variables = {
      //SPRING_DATASOURCE_URL = var.spring_datasource_url
    }
  }
}
