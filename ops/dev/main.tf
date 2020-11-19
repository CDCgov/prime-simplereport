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

module "persistent" {
  source = "./persistent"
  resource_group = data.azurerm_resource_group.k8s.name
  resource_group_location = data.azurerm_resource_group.k8s.location
}

// Network stuff

# since these variables are re-used - a locals block makes this more maintainable

resource "azurerm_virtual_network" "pdi" {
  name = "example-network"
  resource_group_name = data.azurerm_resource_group.k8s.name
  location = data.azurerm_resource_group.k8s.location
  address_space = [
    "10.254.0.0/16"]
}

locals {
  backend_address_pool_name = "${azurerm_virtual_network.pdi.name}-beap"
  frontend_port_name = "${azurerm_virtual_network.pdi.name}-feport"
  frontend_ip_configuration_name = "${azurerm_virtual_network.pdi.name}-feip"
  http_setting_name = "${azurerm_virtual_network.pdi.name}-be-htst"
  listener_name = "${azurerm_virtual_network.pdi.name}-httplstn"
  request_routing_rule_name = "${azurerm_virtual_network.pdi.name}-rqrt"
}

resource "azurerm_subnet" "frontend" {
  name = "frontend"
  resource_group_name = data.azurerm_resource_group.k8s.name
  virtual_network_name = azurerm_virtual_network.pdi.name
  address_prefixes = [
    "10.254.0.0/24"]
}

resource "azurerm_subnet" "backend" {
  name = "backend"
  resource_group_name = data.azurerm_resource_group.k8s.name
  virtual_network_name = azurerm_virtual_network.pdi.name
  address_prefixes = [
    "10.254.2.0/24"]
}

resource "azurerm_public_ip" "pdi-backend" {
  name = "pdi-pip"
  resource_group_name = data.azurerm_resource_group.k8s.name
  location = data.azurerm_resource_group.k8s.location
  allocation_method = "Dynamic"
}

resource "azurerm_application_gateway" "backend" {
  name = "backend-appgateway"
  resource_group_name = data.azurerm_resource_group.k8s.name
  location = data.azurerm_resource_group.k8s.location

  sku {
    name = "Standard_Small"
    tier = "Standard"
    capacity = 2
  }

  gateway_ip_configuration {
    name = "my-gateway-ip-configuration"
    subnet_id = azurerm_subnet.frontend.id
  }

  frontend_port {
    name = local.frontend_port_name
    port = 80
  }

  frontend_ip_configuration {
    name = local.frontend_ip_configuration_name
    public_ip_address_id = azurerm_public_ip.pdi-backend.id
  }

  backend_address_pool {
    name = local.backend_address_pool_name
        fqdns = azurerm_container_group.backend.*.fqdn
  }

  backend_http_settings {
    name = local.http_setting_name
    cookie_based_affinity = "Disabled"
    port = 8080
    protocol = "Http"
    request_timeout = 60
  }

  http_listener {
    name = local.listener_name
    frontend_ip_configuration_name = local.frontend_ip_configuration_name
    frontend_port_name = local.frontend_port_name
    protocol = "Http"
  }

  request_routing_rule {
    name = local.request_routing_rule_name
    rule_type = "Basic"
    http_listener_name = local.listener_name
    backend_address_pool_name = local.backend_address_pool_name
    backend_http_settings_name = local.http_setting_name
  }

  depends_on = [azurerm_virtual_network.pdi, azurerm_public_ip.pdi-backend]
}


// Container group

resource "azurerm_container_group" "backend" {
  count = 3
  name = "pdi-backend-${count.index}"
  location = data.azurerm_resource_group.k8s.location
  resource_group_name = data.azurerm_resource_group.k8s.name
  ip_address_type = "public"
  dns_name_label = "pdi-nrobison-${count.index}"
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
      "SPRING_DATASOURCE_URL": "jdbc:postgresql://${module.persistent.dns_name}:5432/simple_report?user=simple_report_app@pdi-db-nrobison"
      "SPRING_DATASOURCE_PASSWORD": "H@Sh1CoR3!"
      "SPRING_PROFILES_ACTIVE": "dev"
    }
  }
}
