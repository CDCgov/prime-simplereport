# Production has two special App Gateways that perform global redirects instead of routing
# to apps: simple-report-cdc-gov-redirect and simple-report-www-redirect
#
# simple-report-cdc-gov-redirect: redirects simplereport.cdc.gov -> www.simplereport.gov
# simple-report-www-redirect:     redirects simplereport.gov     -> www.simplereport.gov

locals {
  static_backend_pool          = "${local.name}-${local.env}-fe-static"
  static_backend_http_setting  = "${local.name}-${local.env}-fe-static-http"
  static_backend_https_setting = "${local.name}-${local.env}-fe-static-https"
  http_listener                = "${local.name}-http"
  https_listener               = "${local.name}-https"
  frontend_config              = "${local.name}-config"
  zones                        = ["1", "2", "3"]
}

# Shared data sources
data "azurerm_virtual_network" "redirects" {
  name                = "simplereport"
  resource_group_name = data.azurerm_resource_group.rg.name
}

data "azurerm_subnet" "app_gateways" {
  name                 = "ApplicationGateway"
  virtual_network_name = data.azurerm_virtual_network.redirects.name
  resource_group_name  = data.azurerm_resource_group.rg.name
}

data "azurerm_key_vault_certificate" "wildcard_simplereport_gov" {
  key_vault_id = data.azurerm_key_vault.global.id
  name         = "new-sr-wildcard"
}

data "azurerm_key_vault_certificate" "simplereport_cdc_gov" {
  key_vault_id = data.azurerm_key_vault.global.id
  name         = "simplereport-cdc-gov"
}

#####################################################
#                                                   #
# simplereport.gov -> www.simplereport.gov redirect #
#                                                   #
#####################################################

resource "azurerm_public_ip" "www_redirect" {
  name                = "simple-report-www-redirect"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
  allocation_method   = "Static"
  sku                 = "Standard"
  sku_tier            = "Regional"
  domain_name_label   = "simple-report-www-redirect"
  zones               = local.zones
}

resource "azurerm_user_assigned_identity" "www_redirect" {
  name                = "prime-simple-report-${local.env}-www-redirect"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name

  tags = local.management_tags
}

# Gives App Gateway permission to pull SSL cert from Key Vault
resource "azurerm_key_vault_access_policy" "www_redirect" {
  key_vault_id = data.azurerm_key_vault.global.id
  object_id    = azurerm_user_assigned_identity.www_redirect.principal_id
  tenant_id    = data.azurerm_client_config.current.tenant_id

  secret_permissions = ["Get"]
}

resource "azurerm_application_gateway" "www_redirect" {
  name                = "simple-report-www-redirect"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location

  sku {
    name     = "Standard_v2"
    tier     = "Standard_v2"
    capacity = 2
  }

  gateway_ip_configuration {
    name      = "appGatewayIpConfig"
    subnet_id = data.azurerm_subnet.app_gateways.id
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.www_redirect.id]
  }

  # ------- Static -------------------------
  backend_address_pool {
    name = local.static_backend_pool
  }

  backend_http_settings {
    name                                = local.static_backend_http_setting
    cookie_based_affinity               = "Disabled"
    port                                = 80
    protocol                            = "Http"
    request_timeout                     = 20
    pick_host_name_from_backend_address = false
    probe_name                          = "static-http"
  }

  # Need a custom health check for static sites as app gateway doesn't support it
  probe {
    name                                      = "static-http"
    host                                      = "simplereport.gov"
    interval                                  = 10
    path                                      = "/"
    pick_host_name_from_backend_http_settings = false
    protocol                                  = "Http"
    timeout                                   = 10
    unhealthy_threshold                       = 2

    match {
      status_code = ["200-399"]
    }
  }

  # ------- Listeners -------------------------

  frontend_ip_configuration {
    name                 = local.frontend_config
    public_ip_address_id = azurerm_public_ip.www_redirect.id
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
    policy_type          = "Custom"
    min_protocol_version = "TLSv1_2"
    cipher_suites = [
      "TLS_RSA_WITH_AES_256_CBC_SHA256",
      "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384",
      "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
      "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256",
      "TLS_DHE_RSA_WITH_AES_128_GCM_SHA256",
      "TLS_RSA_WITH_AES_128_GCM_SHA256",
      "TLS_RSA_WITH_AES_128_CBC_SHA256"
    ]
  }

  # ------- Routing -------------------------
  # HTTP -> HTTPS redirect
  request_routing_rule {
    priority                    = 10020
    name                        = "httpsRedirect"
    rule_type                   = "Basic"
    http_listener_name          = "${local.name}-http"
    redirect_configuration_name = "httpsRedirect"
  }

  redirect_configuration {
    name = "httpsRedirect"

    include_path         = true
    include_query_string = true
    redirect_type        = "Permanent"
    target_listener_name = local.https_listener
  }

  # HTTPS -> www redirect
  request_routing_rule {
    priority                    = 10010
    name                        = "wwwRedirect"
    rule_type                   = "Basic"
    http_listener_name          = "${local.name}-https"
    redirect_configuration_name = "wwwRedirect"
  }

  redirect_configuration {
    name = "wwwRedirect"

    include_path         = true
    include_query_string = true
    redirect_type        = "Permanent"
    target_url           = "https://www.simplereport.gov"
  }

  depends_on = [
    azurerm_key_vault_access_policy.www_redirect
  ]

  tags = local.management_tags
}

#########################################################
#                                                       #
# simplereport.cdc.gov -> www.simplereport.gov redirect #
#                                                       #
#########################################################

resource "azurerm_public_ip" "cdc_gov_redirect" {
  name                = "simplereport-gw"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
  allocation_method   = "Static"
  sku                 = "Standard"
  sku_tier            = "Regional"
  domain_name_label   = "simplereportgw"
  zones               = local.zones
}

resource "azurerm_user_assigned_identity" "cdc_gov_redirect" {
  name                = "prime-simple-report-${local.env}-cdc-gov-redirect"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name

  tags = local.management_tags
}

# Gives App Gateway permission to pull SSL cert from Key Vault
resource "azurerm_key_vault_access_policy" "cdc_gov_redirect" {
  key_vault_id = data.azurerm_key_vault.global.id
  object_id    = azurerm_user_assigned_identity.cdc_gov_redirect.principal_id
  tenant_id    = data.azurerm_client_config.current.tenant_id

  secret_permissions = ["Get"]
}

resource "azurerm_application_gateway" "cdc_gov_redirect" {
  name                = "simple-report-cdc-gov-redirect"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location

  sku {
    name     = "Standard_v2"
    tier     = "Standard_v2"
    capacity = 2
  }

  gateway_ip_configuration {
    name      = "appGatewayIpConfig"
    subnet_id = data.azurerm_subnet.app_gateways.id
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.cdc_gov_redirect.id]
  }

  # ------- Static -------------------------
  backend_address_pool {
    name = local.static_backend_pool
  }

  backend_http_settings {
    name                                = local.static_backend_http_setting
    cookie_based_affinity               = "Disabled"
    port                                = 80
    protocol                            = "Http"
    request_timeout                     = 20
    pick_host_name_from_backend_address = false
    probe_name                          = "static-http"
  }

  # Need a custom health check for static sites as app gateway doesn't support it
  probe {
    name                                      = "static-http"
    host                                      = "simplereport.cdc.gov"
    interval                                  = 10
    path                                      = "/"
    pick_host_name_from_backend_http_settings = false
    protocol                                  = "Http"
    timeout                                   = 10
    unhealthy_threshold                       = 2

    match {
      status_code = ["200-399"]
    }
  }

  # ------- Listeners -------------------------

  frontend_ip_configuration {
    name                 = local.frontend_config
    public_ip_address_id = azurerm_public_ip.cdc_gov_redirect.id
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
    ssl_certificate_name           = data.azurerm_key_vault_certificate.simplereport_cdc_gov.name
  }

  ssl_certificate {
    name                = data.azurerm_key_vault_certificate.simplereport_cdc_gov.name
    key_vault_secret_id = data.azurerm_key_vault_certificate.simplereport_cdc_gov.secret_id
  }

  ssl_policy {
    policy_type          = "Custom"
    min_protocol_version = "TLSv1_2"
    cipher_suites = [
      "TLS_RSA_WITH_AES_256_CBC_SHA256",
      "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384",
      "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
      "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256",
      "TLS_DHE_RSA_WITH_AES_128_GCM_SHA256",
      "TLS_RSA_WITH_AES_128_GCM_SHA256",
      "TLS_RSA_WITH_AES_128_CBC_SHA256"
    ]
  }

  # ------- Routing -------------------------
  # HTTP -> HTTPS redirect
  request_routing_rule {
    priority                    = 10020
    name                        = "httpsRedirect"
    rule_type                   = "Basic"
    http_listener_name          = "${local.name}-http"
    redirect_configuration_name = "httpsRedirect"
  }

  redirect_configuration {
    name = "httpsRedirect"

    include_path         = true
    include_query_string = true
    redirect_type        = "Permanent"
    target_listener_name = local.https_listener
  }

  # HTTPS -> www redirect
  request_routing_rule {
    priority                    = 10010
    name                        = "wwwRedirect"
    rule_type                   = "Basic"
    http_listener_name          = "${local.name}-https"
    redirect_configuration_name = "wwwRedirect"
  }

  redirect_configuration {
    name = "wwwRedirect"

    include_path         = true
    include_query_string = true
    redirect_type        = "Permanent"
    target_url           = "https://www.simplereport.gov"
  }

  rewrite_rule_set {
    name = "HSTS_ReWrite"

    rewrite_rule {
      name = "HSTS_Rewrite"
      rule_sequence = "100"

      request_header_configuration {
        header_name = "Strict-Transport-Security"
        header_value = "31536000"
      }
    }
  }

  depends_on = [
    azurerm_key_vault_access_policy.cdc_gov_redirect
  ]

  tags = local.management_tags
}
