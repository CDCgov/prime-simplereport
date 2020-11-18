provider "azurerm" {
  version = "~>2.0"
  features {}
  skip_provider_registration = true
}

terraform {
}

data "azurerm_resource_group" "k8s" {
  name = "prime-dev-nrobison"
}

resource "azurerm_postgresql_server" "db" {
  name = "pdi-db-nrobison"
  location = data.azurerm_resource_group.k8s.location
  resource_group_name = data.azurerm_resource_group.k8s.name
  sku_name = "GP_Gen5_4"
  version = "11"
  ssl_enforcement_enabled = false
  administrator_login = "simple_report_app"
  administrator_login_password = "H@Sh1CoR3!"
  public_network_access_enabled = true
}

resource "azurerm_postgresql_database" "simple_report" {
  charset = "UTF8"
  collation = "English_United States.1252"
  name = "simple_report"
  resource_group_name = data.azurerm_resource_group.k8s.name
  server_name = azurerm_postgresql_server.db.name
}

//resource "azurerm_postgresql_firewall_rule" "all" {
//  end_ip_address = "0.0.0.0"
//  name = "AllowAllAzureIps"
//  resource_group_name = data.azurerm_resource_group.k8s.name
//  server_name = azurerm_postgresql_server.db.name
//  start_ip_address = "0.0.0.0"
//}

resource "azurerm_container_group" "backend" {
  name = "pdi-backend"
  location = data.azurerm_resource_group.k8s.location
  resource_group_name = data.azurerm_resource_group.k8s.name
  ip_address_type = "public"
  dns_name_label = "pdi-nrobison"
  os_type = "linux"

  container {
    cpu = 2
    image = "nickrobisonusds/pdi-backend:latest"
    memory = 2
    name = "pdi-backend"
    ports {
      port = 8080
      protocol = "TCP"
    }
    environment_variables = {
      "SPRING_DATASOURCE_URL": "jdbc:postgresql://${azurerm_postgresql_server.db.fqdn}:5432/simple_report"
      "SPRING_DATASOURCE_PASSWORD": "H@Sh1CoR3!"
    }
  }

  depends_on = [
    azurerm_postgresql_database.simple_report
//    azurerm_postgresql_firewall_rule.all
  ]
}


