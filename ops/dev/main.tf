provider "azurerm" {
  version = "~>2.0"
  features {}
  skip_provider_registration = true
}

data "azurerm_resource_group" "rg" {
  name = "prime-simple-report-prod"
}

data "azurerm_key_vault_secret" "simplereport-db-development-password" {
  name = "simplereport"
  vault_uri = "https://simplereport.vault.azure.net/"
}

data "azurerm_log_analytics_workspace" "pdi" {
  name = "simple-report-log-workspace"
  resource_group_name = data.azurerm_resource_group.rg.name
}

data "azurerm_postgresql_server" "db" {
  name = "sr-db-dev"
  resource_group_name = data.azurerm_resource_group.rg.name
}

# since these variables are re-used - a locals block makes this more maintainable
locals {
  backend_address_pool_name = "${data.azurerm_virtual_network.sr.name}-beap"
  frontend_port_name = "${data.azurerm_virtual_network.sr.name}-feport"
  frontend_ip_configuration_name = "${data.azurerm_virtual_network.sr.name}-feip"
  http_setting_name = "${data.azurerm_virtual_network.sr.name}-be-htst"
  listener_name = "${data.azurerm_virtual_network.sr.name}-httplstn"
  request_routing_rule_name = "${data.azurerm_virtual_network.sr.name}-rqrt"

  diag_appgw_logs = [
    "ApplicationGatewayAccessLog",
    "ApplicationGatewayPerformanceLog",
    "ApplicationGatewayFirewallLog",
  ]
  diag_appgw_metrics = [
    "AllMetrics",
  ]

  management_tags = {
    prime-app = "simplereport"
    environment = "development"
  }
}

// Until we import this into Terraform
data "azurerm_virtual_network" "sr" {
  name = "simplereport"
  resource_group_name = data.azurerm_resource_group.rg.name
}

//resource "azurerm_virtual_network" "pdi" {
//  name = "example-network"
//  resource_group_name = data.azurerm_resource_group.rg.name
//  location = data.azurerm_resource_group.rg.location
//  address_space = [
//    "10.254.0.0/16"]
//
//  tags = local.management_tags
//}

//data "azurerm_subnet" "default" {
//  name = "development-default"
//  resource_group_name = data.azurerm_resource_group.rg.name
//  virtual_network_name = "simplereport"
//}
resource "azurerm_subnet" "default" {
  name = "frontend"
  resource_group_name = data.azurerm_resource_group.rg.name
  virtual_network_name = data.azurerm_virtual_network.sr.name
  address_prefixes = [
    "10.1.252.0/24"]
}

data "azurerm_subnet" "backend" {
  name = "development-containers"
  resource_group_name = data.azurerm_resource_group.rg.name
  virtual_network_name = "simplereport"
}

//resource "azurerm_subnet" "backend" {
//  name = "backend"
//  resource_group_name = data.azurerm_resource_group.rg.name
//  virtual_network_name = data.azurerm_virtual_network.sr.name
//  address_prefixes = [
//    "10.254.2.0/24"]
//}

resource "azurerm_public_ip" "pdi-backend" {
  name = "backend-pip"
  resource_group_name = data.azurerm_resource_group.rg.name
  location = data.azurerm_resource_group.rg.location
  allocation_method = "Dynamic"

  tags = local.management_tags
}

// Yes, this probably will take ~20 minutes to deploy and ~5 minutes to change.
resource "azurerm_application_gateway" "backend" {
  name = "backend-appgateway"
  resource_group_name = data.azurerm_resource_group.rg.name
  location = data.azurerm_resource_group.rg.location

  sku {
    name = "Standard_Small"
    tier = "Standard"
    capacity = 2
  }

  gateway_ip_configuration {
    name = "my-gateway-ip-configuration"
    subnet_id = azurerm_subnet.default.id
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

  depends_on = [
    azurerm_public_ip.pdi-backend]

  tags = local.management_tags
}

// This would be nice to add at some point
//resource "azurerm_log_analytics_solution" "backend-awg" {
//  location = data.azurerm_resource_group.k8s.location
//  resource_group_name = data.azurerm_resource_group.k8s.name
//  solution_name = "AzureAppGatewayAnalytics"
//  workspace_name = azurerm_log_analytics_workspace.pdi-log.name
//  workspace_resource_id = azurerm_log_analytics_workspace.pdi-log.id
//  plan {
//    product = "Microsoft"
//    publisher = "OMSGallery/AzureAppGatewayAnalytics"
//  }
//}

resource "azurerm_monitor_diagnostic_setting" "backend-awg" {
  name = "backend-awg1-diag"
  target_resource_id = azurerm_application_gateway.backend.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.pdi.id
  dynamic "log" {
    for_each = local.diag_appgw_logs
    content {
      category = log.value

      retention_policy {
        enabled = false
      }
    }
  }

  dynamic "metric" {
    for_each = local.diag_appgw_metrics
    content {
      category = metric.value

      retention_policy {
        enabled = false
      }
    }
  }
}


// Container group

resource "azurerm_container_group" "backend" {
  count = 3
  name = "pdi-backend-${count.index}"
  location = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
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
      "SPRING_DATASOURCE_URL": "jdbc:postgresql://${data.azurerm_postgresql_server.db.fqdn}:5432/simple_report?user=simple_report_app@${data.azurerm_postgresql_server.db.name}"
      "SPRING_DATASOURCE_PASSWORD": ${data.azurerm_key_vault_secret.simplereport-db-development-password.value}
      "SPRING_PROFILES_ACTIVE": "dev"
    }
  }

  diagnostics {
    log_analytics {
      workspace_id = data.azurerm_log_analytics_workspace.pdi.workspace_id
      workspace_key = data.azurerm_log_analytics_workspace.pdi.primary_shared_key
    }
  }

  tags = local.management_tags
}
