locals {
  backend_address_pool_name = "simple-report-${var.env}-backend-beap"
  frontend_port_name = "simple-report-${var.env}-backend-feport"
  frontend_ip_configuration_name = "simple-report-${var.env}-backend-feip"
  http_setting_name = "simple-report-${var.env}-backend-be-htst"
  listener_name = "simple-report-${var.env}-backend-httplstn"
  request_routing_rule_name = "simple-report-${var.env}-backend-rqrt"

  diag_appgw_logs = [
    "ApplicationGatewayAccessLog",
    "ApplicationGatewayPerformanceLog",
    "ApplicationGatewayFirewallLog",
  ]
  diag_appgw_metrics = [
    "AllMetrics",
  ]
}


data "azurerm_key_vault_secret" "db_password" {
  key_vault_id = var.key_vault_id
  name = "simple-report-${var.env}-db-password"
}

data "azurerm_key_vault_secret" "okta_client_id" {
  key_vault_id = var.key_vault_id
  name = "okta-${var.env}-client-id"
}

data "azurerm_key_vault_secret" "okta_client_secret" {
  key_vault_id = var.key_vault_id
  name = "okta-${var.env}-client-secret"
}

// Container network

resource "azurerm_subnet" "containers" {
  name = "simple-report-${var.env}-containers"
  resource_group_name = var.rg_name
  virtual_network_name = var.network_name
  address_prefixes = [
    "10.1.250.0/24"]
  service_endpoints = ["Microsoft.Sql"]

  delegation {
    name = "delegation"
    service_delegation {
      name = "Microsoft.ContainerInstance/containerGroups"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

resource "azurerm_network_profile" "containers" {
  location = var.rg_location
  name = "simple-report-${var.env}-container-profile"
  resource_group_name = var.rg_name
  container_network_interface {
    name = "containernic"
    ip_configuration {
      name = "containerip"
      subnet_id = azurerm_subnet.containers.id
    }
  }
}

// Container group
resource "azurerm_container_group" "backend" {
  count = var.backend_scale
  name = "simple-report-${var.env}-backend-${count.index}"
  location = var.rg_location
  resource_group_name = var.rg_name
  ip_address_type = "private"
  network_profile_id = azurerm_network_profile.containers.id
  os_type = "linux"

  container {
    cpu = 2
    image = var.container_id
    memory = 2
    name = "simple-report-backend"
    ports {
      port = 8080
      protocol = "TCP"
    }
    secure_environment_variables = {
      "SPRING_DATASOURCE_URL": "jdbc:postgresql://${var.db_dns_name}:5432/simple_report?user=${var.db_username}@${var.db_server_name}&password=${data.azurerm_key_vault_secret.db_password.value}&sslmode=require",
      "OKTA_OAUTH2_CLIENT_ID": data.azurerm_key_vault_secret.okta_client_id.value,
      "OKTA_OAUTH2_CLIENT_SECRET": data.azurerm_key_vault_secret.okta_client_secret.value,
    }
    environment_variables = {
      "SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA": "public",
      "OKTA_OAUTH2_ISSUER": "https://hhs-prime.okta.com/oauth2/default",
    }
  }

  diagnostics {
    log_analytics {
      workspace_id = var.log_workspace_id
      workspace_key = var.log_workspace_key
    }
  }

  tags = var.tags
}

// Connect containers to DB
resource "azurerm_postgresql_virtual_network_rule" "inbound" {
  name = "inbound-container-subnet"
  resource_group_name = var.rg_name
  server_name = var.db_server_name
  subnet_id = azurerm_subnet.containers.id
  ignore_missing_vnet_service_endpoint = true
}


// Create application gateway
// With public IP address

resource "azurerm_subnet" "default" {
  name = "simple-report-${var.env}-frontend"
  resource_group_name = var.rg_name
  virtual_network_name = var.network_name
  address_prefixes = [
    "10.1.251.0/24"]
}

resource "azurerm_public_ip" "backend" {
  name = "backend-pip"
  resource_group_name = var.rg_name
  location = var.rg_location
  allocation_method = "Dynamic"

  tags = var.tags
}

// Yes, this probably will take ~20 minutes to deploy and ~5 minutes to change.
resource "azurerm_application_gateway" "backend" {
  name = "backend-appgateway"
  resource_group_name = var.rg_name
  location = var.rg_location

  sku {
    name = "Standard_Small"
    tier = "Standard"
    capacity = 2
  }

  gateway_ip_configuration {
    name = "${var.env}-backend-gateway-ip-configuration"
    subnet_id = azurerm_subnet.default.id
  }

  frontend_port {
    name = local.frontend_port_name
    port = 80
  }

  frontend_ip_configuration {
    name = local.frontend_ip_configuration_name
    public_ip_address_id = azurerm_public_ip.backend.id
  }

  backend_address_pool {
    name = local.backend_address_pool_name
    ip_addresses = azurerm_container_group.backend.*.ip_address
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
    azurerm_public_ip.backend]

  tags = var.tags
}

// Gateway analytics

resource "azurerm_monitor_diagnostic_setting" "backend-awg" {
  name = "backend-${var.env}-gateway-diag"
  target_resource_id = azurerm_application_gateway.backend.id
  log_analytics_workspace_id = var.log_workspace_uri
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

// Setup DNS for backend Gateway
data "azurerm_dns_zone" "sr" {
  resource_group_name = "prime-simple-report-prod"
  name = "simplereport.org"
}

resource "azurerm_dns_a_record" "backend" {
  name = "api.${var.env}"
  resource_group_name = "prime-simple-report-prod"
  ttl = 300
  zone_name = data.azurerm_dns_zone.sr.name
  records = [azurerm_public_ip.backend.ip_address]
}
