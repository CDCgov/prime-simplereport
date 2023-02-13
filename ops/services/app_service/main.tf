locals {
  all_app_settings = merge(var.app_settings,
    {
      for k, v in var.deploy_info : join("_", ["INFO", "DEPLOY", upper(k)]) => v
      if v != ""
    },
    {
      "DOCKER_REGISTRY_SERVER_PASSWORD" = data.terraform_remote_state.global.outputs.acr_simeplereport_admin_password
      "DOCKER_REGISTRY_SERVER_URL"      = "https://${data.terraform_remote_state.global.outputs.acr_simeplereport_name}.azurecr.io"
      "DOCKER_REGISTRY_SERVER_USERNAME" = data.terraform_remote_state.global.outputs.acr_simeplereport_name
      "WEBSITES_PORT"                   = "8080"
      "WEBSITE_DNS_SERVER"              = "168.63.129.16" # https://docs.microsoft.com/en-us/azure/app-service/web-sites-integrate-with-vnet#azure-dns-private-zones
  })
}

# migrate this to azurerm_service_plan.service_plan to enable migration of api service
# resource "azurerm_app_service_plan" "service_plan" {
#   name                = "${var.az_account}-appserviceplan-${var.env}"
#   location            = var.resource_group_location
#   resource_group_name = var.resource_group_name
#   kind                = "linux"
#   reserved            = true
#   sku {
#     tier = "PremiumV3"
#     size = "P1v3"
#   }
# }

resource "azurerm_service_plan" "service_plan" {
  name                = "${var.az_account}-appserviceplan-${var.env}"
  location            = var.resource_group_location
  os_type             = "Linux"
  resource_group_name = var.resource_group_name
  sku_name            = "P2v3"
}

# DO NOT DELETE THIS RESOURCE before migrating it to azurerm_linux_web_app.service
# if this resource is deleted during this upgrade it will require additional DNS work
# resource "azurerm_app_service" "service" {
#   name                = "${var.name}-${var.env}"
#   location            = var.resource_group_location
#   resource_group_name = var.resource_group_name
#   app_service_plan_id = azurerm_app_service_plan.service_plan.id

#   # Configure Docker Image to load on start
#   site_config {
#     linux_fx_version = var.docker_image
#     always_on        = "true"
#     min_tls_version  = "1.2"
#     ftps_state       = "Disabled"

#     // NOTE: If this code is removed, TF will not automatically delete it with the current provider version! It must be removed manually from the App Service -> Networking blade!
#     ip_restriction {
#       virtual_network_subnet_id = var.lb_subnet_id
#       action                    = "Allow"
#     }
#   }

#   app_settings = local.all_app_settings
#   https_only   = var.https_only

#   identity {
#     type = "SystemAssigned"
#   }

#   logs {
#     http_logs {
#       file_system {
#         retention_in_days = 7
#         retention_in_mb   = 30
#       }
#     }
#   }

#   lifecycle {
#     ignore_changes = [
#       app_settings, site_config[0].linux_fx_version
#     ]
#   }
# }

# The following code snippet creates a Linux App Service and configures it to run a Docker container. 
# It also creates a firewall rule allowing the load balancer to route traffic to the App Service.
# The docker_image variable is defined in the variables.tf file.
# The docker_image_tag variable is defined in the variables.tf file.
resource "azurerm_linux_web_app" "service" {
  name                      = "${var.name}-${var.env}"
  app_settings              = local.all_app_settings
  https_only                = var.https_only
  location                  = var.resource_group_location
  resource_group_name       = var.resource_group_name
  service_plan_id           = azurerm_service_plan.service_plan.id
  virtual_network_subnet_id = var.webapp_subnet_id

  identity {
    type = "SystemAssigned"
  }

  logs {
    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 30
      }
    }
  }

  # Configure Docker Image to load on start
  site_config {
    always_on               = "true"
    scm_minimum_tls_version = "1.0"
    use_32_bit_worker       = false
    ftps_state              = "Disabled"
    vnet_route_all_enabled  = false

    cors {
      allowed_origins     = []
      support_credentials = false
    }

    application_stack {
      docker_image     = var.docker_image
      docker_image_tag = var.docker_image_tag
    }

    // NOTE: If this code is removed, TF will not automatically delete it with the current provider version! It must be removed manually from the App Service -> Networking blade!
    ip_restriction {
      virtual_network_subnet_id = var.lb_subnet_id
      action                    = "Allow"
    }
  }
}

# Creates a staging slot for the Linux Web App
# This is used for staging the deployment of the new code

resource "azurerm_linux_web_app_slot" "staging" {
  name                      = "staging"
  app_service_id            = azurerm_linux_web_app.service.id
  app_settings              = local.all_app_settings
  https_only                = var.https_only
  virtual_network_subnet_id = var.webapp_subnet_id

  identity {
    type = "SystemAssigned"
  }

  logs {
    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 30
      }
    }
  }

  # Configure Docker Image to load on start
  site_config {
    always_on               = "true"
    scm_minimum_tls_version = "1.0"
    use_32_bit_worker       = false
    ftps_state              = "Disabled"
    vnet_route_all_enabled  = false

    cors {
      allowed_origins     = []
      support_credentials = false
    }

    application_stack {
      docker_image     = var.docker_image
      docker_image_tag = var.docker_image_tag
    }

    // NOTE: If this code is removed, TF will not automatically delete it with the current provider version! It must be removed manually from the App Service -> Networking blade!
    ip_restriction {
      virtual_network_subnet_id = var.lb_subnet_id
      action                    = "Allow"
    }
  }
}

resource "azurerm_key_vault_access_policy" "app_secret_access" {
  key_vault_id = var.key_vault_id
  object_id    = azurerm_linux_web_app.service.identity[0].principal_id
  tenant_id    = var.tenant_id

  key_permissions = [
    "Get",
    "List",
  ]
  secret_permissions = [
    "Get",
    "List",
  ]
}

resource "azurerm_key_vault_access_policy" "staging_slot_secret_access" {
  key_vault_id = var.key_vault_id
  object_id    = azurerm_linux_web_app_slot.staging.identity[0].principal_id
  tenant_id    = var.tenant_id

  key_permissions = [
    "Get",
    "List",
  ]
  secret_permissions = [
    "Get",
    "List",
  ]
}

# Associate the App Service and staging slot with the environment's VNet:

resource "azurerm_app_service_virtual_network_swift_connection" "app" {
  app_service_id = azurerm_linux_web_app.service.id
  subnet_id      = var.webapp_subnet_id
}

resource "azurerm_app_service_slot_virtual_network_swift_connection" "staging" {
  slot_name      = azurerm_linux_web_app_slot.staging.name
  app_service_id = azurerm_linux_web_app.service.id
  subnet_id      = var.webapp_subnet_id
}

/*
  IMPORTANT APP SERVICE TLS/SSL INFORMATION

  (Note: if the static IP to the App Gateway changes, you will need to update the DNS A record
  for origin-ENV.simplereport.gov)

  For routing from the App Gateway to the App Service to work correctly, the App Service needs
  a custom domain in the form of api-ENV.simplereport.gov. We can't create this domain in Terraform
  without outside action, because part of the creation process requires proving ownership of the
  underlying domain (simplereport.gov). Proving ownership requires updating the DNS CNAME and TXT
  records associated with the custom domain (the correct values are provided by Azure).

  So, the process is to create and bind this custom domain MANUALLY. Once you try to create the
  custom domain, Azure will provide instructions on what DNS records to update and what the expected
  values are. Once the records are changed, Azure will allow you to complete the custom domain
  binding.

  IMPORTANT: If the environment is using a CDN (e.g., Akamai) the CNAME will need to be changed
  temporarily to allow Azure to verify ownership of the domain, and then changed BACK to the original
  value, or the CDN will stop functioning correctly.

  Once this process is complete, Terraform can be run as normal.

  WHAT'S HAPPENING HERE:

  1) The new-sr-wildcard cert is being imported from Key Vault into the App Service
    [NOTE: This only takes place if this is the first environment being created in this environment level. Cert ownership is bound to the index-less environment!]
  2) That cert is being bound to the custom domain created above, enabling HTTPS
*/

resource "azurerm_app_service_certificate" "app" {
  count               = var.env_index == 1 ? 1 : 0
  name                = "new-sr-wildcard"
  resource_group_name = var.resource_group_name
  location            = var.resource_group_location
  key_vault_secret_id = data.azurerm_key_vault_certificate.wildcard_simplereport_gov.id
}

resource "azurerm_app_service_certificate_binding" "app" {
  # This is a bit magic because as of 4/2022 the TF Azure provider doesn't expose
  # azurerm_app_service_custom_hostname_binding as a data source. This means we need to generate
  # hostname_binding_id manually.
  #
  # Azure only allows for a single instance of a certificate fingerprint in a specific resource group.connection {
  # in resource groups with multiple environments, we have to work around this by using this
  # prescribed value for certificate_id. 
  hostname_binding_id = "${azurerm_linux_web_app.service.id}/hostNameBindings/api-${var.env}.simplereport.gov"
  certificate_id      = "${data.azurerm_subscription.primary.id}/resourceGroups/${var.resource_group_name}/providers/Microsoft.Web/certificates/new-sr-wildcard"
  ssl_state           = "SniEnabled"
}
