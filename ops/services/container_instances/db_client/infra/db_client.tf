resource "azurerm_container_group" "db_client" {
  name                = "${var.name}-${var.env}-db-client"
  location            = var.resource_group_location
  resource_group_name = var.resource_group_name
  ip_address_type     = "Private"
  subnet_ids          = [var.subnet_id]
  os_type             = "Linux"
  restart_policy      = "OnFailure"

  image_registry_credential {
    username = var.acr_username
    password = var.acr_password
    server   = var.acr_server
  }

  container {
    name   = "${var.name}-${var.env}-db-client"
    image  = "${var.acr_server}/api/simple-report-db-client:3.0.0"
    cpu    = "1"
    memory = "1.5"

    // Not a real port but *a* port is required, so expose a port the container hopefully doesn't respond to
    ports {
      port     = 1234
      protocol = "TCP"
    }

    volume {
      name       = "${var.name}-${var.env}-db-client-volume"
      read_only  = false
      mount_path = "/export"

      storage_account_name = var.storage_account_name
      storage_account_key  = var.storage_account_key
      share_name           = var.storage_share_name
    }

    liveness_probe {
      exec                  = ["cat", "/tmp/psql_version"]
      initial_delay_seconds = 60
      period_seconds        = 10
    }
  }

  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}
