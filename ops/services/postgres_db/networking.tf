// TODO: delete this when removing old DB configuration - Flexible
// Server uses VNet injection instead of Private Link for non-
// public connections so this is no longer needed.
resource "azurerm_private_endpoint" "db" {
  name                = "${var.env}-db-privatelink"
  location            = var.rg_location
  resource_group_name = var.rg_name
  subnet_id           = var.old_subnet_id

  private_service_connection {
    name                           = "${var.env}-db-privatelink"
    is_manual_connection           = false
    private_connection_resource_id = azurerm_postgresql_server.db.id
    subresource_names              = ["postgresqlServer"]
  }

  private_dns_zone_group {
    name                 = "default"
    private_dns_zone_ids = [var.dns_zone_id]
  }

  tags = {
    environment : var.env
  }
}
