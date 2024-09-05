locals {
  static_backend_pool             = "${var.name}-${var.env}-fe-static"
  static_backend_http_setting     = "${var.name}-${var.env}-fe-static-http"
  static_backend_https_setting    = "${var.name}-${var.env}-fe-static-https"
  api_backend_pool                = "${var.name}-${var.env}-be-api"
  api_backend_http_setting        = "${var.name}-${var.env}-be-api-http"
  api_backend_https_setting       = "${var.name}-${var.env}-be-api-https"
  metabase_pool                   = "${var.name}-${var.env}-be-metabase"
  metabase_http_setting           = "${var.name}-${var.env}-be-api-metabase-http"
  metabase_https_setting          = "${var.name}-${var.env}-be-api-metabase-https"
  staging_pool                    = "${var.name}-${var.env}-be-staging"
  staging_http_setting            = "${var.name}-${var.env}-be-api-staging-http"
  staging_https_setting           = "${var.name}-${var.env}-be-api-staging-https"
  http_listener                   = "${var.name}-http"
  https_listener                  = "${var.name}-https"
  frontend_config                 = "${var.name}-config"
  redirect_rule                   = "${var.name}-redirect"
  redirect_self_registration_rule = "${var.name}-redirect-self-registration"
  redirect_metabase_rule          = "${var.name}-redirect-metabase"
  redirect_staging_slot_rule      = "${var.name}-redirect-staging"
  url_prefix                      = var.env == "prod" ? "www" : var.env
  app_url                         = "https://${local.url_prefix}.simplereport.gov/app"
  metabase_url                    = "https://prime-simple-report-${var.env}-metabase.azurewebsites.net"
  staging_slot_url                = "https://simple-report-api-${var.env}-staging.azurewebsites.net/actuator/health/readiness"
}

resource "azurerm_public_ip" "static_gateway" {
  name                = "${var.name}-${var.env}-gateway"
  resource_group_name = var.resource_group_name
  location            = var.resource_group_location
  allocation_method   = "Static"
  sku                 = "Standard"
  zones               = var.zones

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
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.gateway.id]
  }

  # ------- Static -------------------------
  backend_address_pool {
    name  = local.static_backend_pool
    fqdns = [var.blob_endpoint]
  }

  backend_http_settings {
    name                                = local.static_backend_http_setting
    cookie_based_affinity               = "Disabled"
    port                                = 80
    protocol                            = "Http"
    request_timeout                     = 20
    pick_host_name_from_backend_address = true
    probe_name                          = "static-http"
  }

  backend_http_settings {
    name                                = local.static_backend_https_setting
    cookie_based_affinity               = "Disabled"
    port                                = 443
    protocol                            = "Https"
    request_timeout                     = 20
    pick_host_name_from_backend_address = true
    probe_name                          = "static-https"
  }

  # Need a custom health check for static sites as app gateway doesn't support it
  probe {
    name                                      = "static-http"
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

  probe {
    name                                      = "static-https"
    interval                                  = 10
    path                                      = "/"
    pick_host_name_from_backend_http_settings = true
    protocol                                  = "Https"
    timeout                                   = 10
    unhealthy_threshold                       = 3

    match {
      status_code = ["200-399"]
    }
  }

  # ------- Backend API App -------------------------
  backend_address_pool {
    name         = local.api_backend_pool
    fqdns        = var.fqdns
    ip_addresses = var.ip_addresses
  }

  backend_http_settings {
    name                                = local.api_backend_http_setting
    cookie_based_affinity               = "Disabled"
    port                                = 80
    protocol                            = "Http"
    request_timeout                     = 60
    pick_host_name_from_backend_address = true
    probe_name                          = "be-http"
  }

  backend_http_settings {
    name                                = local.api_backend_https_setting
    cookie_based_affinity               = "Disabled"
    port                                = 443
    protocol                            = "Https"
    request_timeout                     = 60
    pick_host_name_from_backend_address = true
    probe_name                          = "be-https"
  }

  probe {
    name                                      = "be-http"
    interval                                  = 10
    path                                      = "/actuator/health"
    pick_host_name_from_backend_http_settings = true
    protocol                                  = "Http"
    timeout                                   = 10
    unhealthy_threshold                       = 3

    match {
      body        = "UP"
      status_code = [200]
    }
  }

  probe {
    name                                      = "be-https"
    interval                                  = 10
    path                                      = "/actuator/health"
    pick_host_name_from_backend_http_settings = true
    protocol                                  = "Https"
    timeout                                   = 10
    unhealthy_threshold                       = 3

    match {
      body        = "UP"
      status_code = [200]
    }
  }

  # ------- Backend Metabase App -------------------------
  backend_address_pool {
    name         = local.metabase_pool
    fqdns        = var.metabase_fqdns
    ip_addresses = var.metabase_ip_addresses
  }

  backend_http_settings {
    name                                = local.metabase_http_setting
    cookie_based_affinity               = "Disabled"
    port                                = 80
    protocol                            = "Http"
    request_timeout                     = 20
    pick_host_name_from_backend_address = true
  }

  backend_http_settings {
    name                                = local.metabase_https_setting
    cookie_based_affinity               = "Disabled"
    port                                = 443
    protocol                            = "Https"
    request_timeout                     = 20
    pick_host_name_from_backend_address = true
  }

  # ------- Backend Staging Slot -------------------------
  backend_address_pool {
    name         = local.staging_pool
    fqdns        = var.staging_fqdns
    ip_addresses = var.staging_ip_addresses
  }

  backend_http_settings {
    name                                = local.staging_http_setting
    cookie_based_affinity               = "Disabled"
    port                                = 80
    protocol                            = "Http"
    request_timeout                     = 20
    pick_host_name_from_backend_address = true
    probe_name                          = "be-http"
  }

  backend_http_settings {
    name                                = local.staging_https_setting
    cookie_based_affinity               = "Disabled"
    port                                = 443
    protocol                            = "Https"
    request_timeout                     = 20
    pick_host_name_from_backend_address = true
    probe_name                          = "be-https"
  }

  # ------- Listeners -------------------------

  frontend_ip_configuration {
    name                 = local.frontend_config
    public_ip_address_id = azurerm_public_ip.static_gateway.id
  }

  # --- HTTP Listener
  frontend_port {
    name = local.http_listener
    port = 80
  }

  http_listener {
    name                           = local.http_listener
    frontend_ip_configuration_name = local.frontend_config
    frontend_port_name             = local.http_listener
    protocol                       = "Http"
  }

  # --- HTTPS Listener ---

  frontend_port {
    name = local.https_listener
    port = 443
  }

  http_listener {
    name                           = local.https_listener
    frontend_ip_configuration_name = local.frontend_config
    frontend_port_name             = local.https_listener
    protocol                       = "Https"
    ssl_certificate_name           = data.azurerm_key_vault_certificate.wildcard_simplereport_gov.name
  }

  ssl_certificate {
    name                = data.azurerm_key_vault_certificate.wildcard_simplereport_gov.name
    key_vault_secret_id = data.azurerm_key_vault_certificate.wildcard_simplereport_gov.secret_id
  }

  ssl_policy {
    policy_name = "AppGwSslPolicy20170401S"
    policy_type = "Predefined"
  }

  # ------- Routing -------------------------
  # HTTP -> HTTPS redirect
  request_routing_rule {
    name                        = local.redirect_rule
    priority                    = 100
    rule_type                   = "Basic"
    http_listener_name          = "${var.name}-http"
    redirect_configuration_name = local.redirect_rule
  }

  redirect_configuration {
    name = local.redirect_rule

    include_path         = true
    include_query_string = true
    redirect_type        = "Permanent"
    target_listener_name = local.https_listener
  }

  # HTTPS path-based routing
  request_routing_rule {
    name                       = "${var.name}-routing-https"
    priority                   = 200
    rule_type                  = "PathBasedRouting"
    http_listener_name         = local.https_listener
    backend_address_pool_name  = local.static_backend_pool
    backend_http_settings_name = local.static_backend_https_setting
    url_path_map_name          = "${var.env}-urlmap"
  }

  url_path_map {
    name                               = "${var.env}-urlmap"
    default_backend_address_pool_name  = local.static_backend_pool
    default_backend_http_settings_name = local.static_backend_https_setting
    default_rewrite_rule_set_name      = "simple-report-routing"

    path_rule {
      name                       = "api"
      paths                      = ["/api/*", "/api"]
      backend_address_pool_name  = local.api_backend_pool
      backend_http_settings_name = local.api_backend_https_setting
      // this is the default, why would we set it again?
      // because if we don't do this we get 404s on API calls
      rewrite_rule_set_name = "simple-report-routing"
    }

    path_rule {
      name                       = "react-static"
      paths                      = ["/app/static/*"]
      backend_address_pool_name  = local.static_backend_pool
      backend_http_settings_name = local.static_backend_https_setting
    }

    path_rule {
      name                        = "self-registration"
      paths                       = ["/register/*"]
      redirect_configuration_name = local.redirect_self_registration_rule
    }

    path_rule {
      name                       = "staging-slot"
      paths                      = ["/staging/*", "/staging"]
      backend_address_pool_name  = local.staging_pool
      backend_http_settings_name = local.staging_https_setting
      // this is the default, why would we set it again?
      // because if we don't do this we get 404s on API calls
      rewrite_rule_set_name = "simple-report-staging-routing"
    }

    path_rule {
      name                       = "metabase"
      paths                      = ["/metabase/*", "/metabase"]
      backend_address_pool_name  = local.metabase_pool
      backend_http_settings_name = local.metabase_https_setting
      rewrite_rule_set_name      = "simple-report-metabase-routing"
    }
  }

  redirect_configuration {
    name = local.redirect_self_registration_rule

    include_path         = true
    include_query_string = true
    redirect_type        = "Permanent"
    target_url           = local.app_url
  }

  rewrite_rule_set {
    name = "simple-report-metabase-routing"

    rewrite_rule {
      name          = "metabase-wildcard"
      rule_sequence = 100
      condition {
        ignore_case = true
        negate      = false
        pattern     = ".*/metabase(.*)"
        variable    = "var_uri_path"
      }

      url {
        path    = "/{var_uri_path_1}"
        reroute = false
        # Per documentation, we should be able to leave this pass-through out. See however
        # https://github.com/terraform-providers/terraform-provider-azurerm/issues/11563
        query_string = "{var_query_string}"
      }
    }
  }

  rewrite_rule_set {
    name = "simple-report-staging-routing"

    rewrite_rule {
      name          = "staging-wildcard"
      rule_sequence = 100
      condition {
        ignore_case = true
        negate      = false
        pattern     = ".*api/(.*)"
        variable    = "var_uri_path"
      }

      url {
        path    = "/{var_uri_path_1}"
        reroute = false
        # Per documentation, we should be able to leave this pass-through out. See however
        # https://github.com/terraform-providers/terraform-provider-azurerm/issues/11563
        query_string = "{var_query_string}"
      }
    }
  }

  rewrite_rule_set {
    name = "simple-report-routing"

    rewrite_rule {
      name          = "api-wildcard"
      rule_sequence = 101
      condition {
        ignore_case = true
        negate      = false
        pattern     = ".*api/(.*)"
        variable    = "var_uri_path"
      }

      url {
        path    = "/{var_uri_path_1}"
        reroute = false
        # Per documentation, we should be able to leave this pass-through out. See however
        # https://github.com/terraform-providers/terraform-provider-azurerm/issues/11563
        query_string = "{var_query_string}"
      }
    }

    rewrite_rule {
      name          = "react-app"
      rule_sequence = 105

      condition {
        ignore_case = true
        negate      = false
        pattern     = ".*app/(.*)"
        variable    = "var_uri_path"
      }

      url {
        path = "/app"
        # This is probably excessive, but it was happening anyway: see
        # https://github.com/terraform-providers/terraform-provider-azurerm/issues/11563
        query_string = ""
        reroute      = true
      }
    }

    rewrite_rule {
      name          = "HSTS"
      rule_sequence = 101

      response_header_configuration {
        header_name  = "Strict-Transport-Security"
        header_value = "max-age=31536000"
      }
    }

  }

  autoscale_configuration {
    min_capacity = var.autoscale_min
    max_capacity = var.autoscale_max
  }

  depends_on = [
    azurerm_public_ip.static_gateway,
    azurerm_key_vault_access_policy.gateway
  ]

  firewall_policy_id = var.firewall_policy_id

  tags = var.tags

  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}


// Gateway analytics
resource "azurerm_monitor_diagnostic_setting" "logs_metrics" {
  name                       = "${var.name}-${var.env}-gateway-logs-metrics"
  target_resource_id         = azurerm_application_gateway.load_balancer.id
  log_analytics_workspace_id = var.log_workspace_uri

  dynamic "enabled_log" {
    for_each = [
      "ApplicationGatewayAccessLog",
      "ApplicationGatewayPerformanceLog",
      "ApplicationGatewayFirewallLog",
    ]
    content {
      category = enabled_log.value
    }
  }

  dynamic "metric" {
    for_each = [
      "AllMetrics",
    ]
    content {
      category = metric.value
    }
  }
}
