locals {
  static_backend_pool         = "${var.name}-${var.env}-be-static"
  static_backend_http_setting = "${var.name}-${var.env}-be-static"
}

resource "azurerm_public_ip" "static_gateway" {
  name                = "${var.name}-${var.env}-gateway"
  resource_group_name = var.resource_group_name
  location            = var.resource_group_location
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = var.tags
}

resource "azurerm_application_gateway" "load_balancer" {
  name                = "${var.name}-app-gateway"
  resource_group_name = var.resource_group_name
  location            = var.resource_group_location

  sku {
    name = var.sku_name
    tier = var.sku_tier
  }

  gateway_ip_configuration {
    name      = "${var.name}-${var.env}-gateway-ip-config"
    subnet_id = var.subnet_id
  }

  identity {
    type = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.gateway.id]
  }

  # ------- Static -------------------------
  backend_address_pool {
    name  = local.static_backend_pool
    fqdns = [var.cdn_hostname]
  }

  backend_http_settings {
    name                                = local.static_backend_http_setting
    cookie_based_affinity               = "Disabled"
    port                                = 80
    protocol                            = "Http"
    request_timeout                     = 20
    pick_host_name_from_backend_address = true
    probe_name                          = "static"
  }

  # Need a custom health check for static sites as app gateway doesn't support it
  probe {
    name                                      = "static"
    interval                                  = 10
    path                                      = "/"
    pick_host_name_from_backend_http_settings = true
    protocol                                  = "Http"
    timeout                                   = 10
    unhealthy_threshold                       = 3

    match {
      status_code = ["200-399"]
    }
  }

  # ------- Backend API App -------------------------
  backend_address_pool {
    name         = "${var.name}-be-api"
    fqdns        = var.fqdns
    ip_addresses = var.ip_addresses
  }

  backend_http_settings {
    name                                = "${var.name}-be-api"
    cookie_based_affinity               = "Disabled"
    port                                = 80
    protocol                            = "Http"
    request_timeout                     = 20
    pick_host_name_from_backend_address = true
  }

  # ------- Listeners & Routing -------------------------

  frontend_ip_configuration {
    name                 = "${var.name}-fe-ip-config"
    public_ip_address_id = azurerm_public_ip.static_gateway.id
  }

  # --- HTTP Listener
  frontend_port {
    name = "${var.name}-fe-port"
    port = 80
  }

  http_listener {
    name                           = "${var.name}-static"
    frontend_ip_configuration_name = "${var.name}-fe-ip-config"
    frontend_port_name             = "${var.name}-fe-port"
    protocol                       = "Http"
  }

  request_routing_rule {
    name                       = "${var.name}-routing-static"
    rule_type                  = "Basic"
    http_listener_name         = "${var.name}-static"
    backend_address_pool_name  = local.static_backend_pool
    backend_http_settings_name = local.static_backend_http_setting
    //    url_path_map_name          = "${var.env}-urlmap"
  }

  # --- HTTPS Listener ---

  frontend_port {
    name = "${var.name}-fe-https-port"
    port = 443
  }

  http_listener {
    name                           = "${var.name}-https-static"
    frontend_ip_configuration_name = "${var.name}-fe-ip-config"
    frontend_port_name             = "${var.name}-fe-https-port"
    protocol                       = "Https"
    ssl_certificate_name = data.azurerm_key_vault_certificate.certificate.name
  }

  ssl_certificate {
    name = data.azurerm_key_vault_certificate.certificate.name
    key_vault_secret_id = data.azurerm_key_vault_certificate.certificate.secret_id
  }

  request_routing_rule {
    name                       = "${var.name}-routing-https-static"
    rule_type                  = "Basic"
    http_listener_name         = "${var.name}-https-static"
    backend_address_pool_name  = local.static_backend_pool
    backend_http_settings_name = local.static_backend_http_setting
  }
//
//  url_path_map {
//    name                               = "${var.env}-urlmap"
//    default_backend_address_pool_name  = local.static_backend_pool
//    default_backend_http_settings_name = local.static_backend_http_setting
//    default_rewrite_rule_set_name      = "api"
//
//    path_rule {
//      name                       = "api"
//      paths                      = ["/api/*", "/api"]
//      backend_address_pool_name  = "${var.name}-be-api"
//      backend_http_settings_name = "${var.name}-be-api"
//      rewrite_rule_set_name      = "api"
//    }
//
//    path_rule {
//      name                       = "react-static"
//      paths                      = ["/app/static/*"]
//      backend_address_pool_name  = "${var.name}-be-static"
//      backend_http_settings_name = "${var.name}-be-static"
//    }
//  }

  autoscale_configuration {
    min_capacity = var.autoscale_min
    max_capacity = var.autoscale_max
  }

  depends_on = [
    azurerm_public_ip.static_gateway,
    azurerm_key_vault_access_policy.gateway
  ]

  tags = var.tags

  # Azure doesn't not support rewrite rules efficiently so they must be manually built out
  lifecycle {
    ignore_changes = [
      request_routing_rule,
      rewrite_rule_set,
      url_path_map
    ]
  }
}
