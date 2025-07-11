locals {
  all_app_settings = merge(var.app_settings,
    {
      for k, v in var.deploy_info : join("_", ["INFO", "DEPLOY", upper(k)]) => v
      if v != ""
    },
    {
      "WEBSITES_PORT"      = "8080"
      "WEBSITE_DNS_SERVER" = "168.63.129.16" # https://docs.microsoft.com/en-us/azure/app-service/web-sites-integrate-with-vnet#azure-dns-private-zones
  })
  # docker_settings = merge(var.docker_settings,
  #   {
  #     for k, v in var.deploy_info : join("_", ["INFO", "DEPLOY", upper(k)]) => v
  #     if v != ""
  #   },
  #   {
  #     "DOCKER_REGISTRY_SERVER_PASSWORD" = data.terraform_remote_state.global.outputs.acr_simeplereport_admin_password
  #     "DOCKER_REGISTRY_SERVER_URL"      = "https://${data.terraform_remote_state.global.outputs.acr_simeplereport_name}.azurecr.io"
  #     "DOCKER_REGISTRY_SERVER_USERNAME" = data.terraform_remote_state.global.outputs.acr_simeplereport_name
  # })

}

resource "azurerm_service_plan" "service_plan" {
  name                = "${var.az_account}-appserviceplan-${var.env}"
  location            = var.resource_group_location
  os_type             = "Linux"
  resource_group_name = var.resource_group_name
  sku_name            = var.sku_name
}

# The following code snippet creates a Linux App Service and configures it to run a Docker container. 
# It also creates a firewall rule allowing the load balancer to route traffic to the App Service.
# We do not define an application_stack for this web app service.
# This is done in the staging slot, and we swap the slots after it becomes healthy.
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
    always_on                         = "true"
    health_check_path                 = "/actuator/health"
    health_check_eviction_time_in_min = 5
    scm_minimum_tls_version           = "1.2"
    use_32_bit_worker                 = false
    ftps_state                        = "Disabled"
    vnet_route_all_enabled            = false
    ip_restriction_default_action     = "Deny" # Should use behavior set in the ip_restriction
    scm_ip_restriction_default_action = "Deny" # We don't use Kudu or the SCM site tools

    // NOTE: If this code is removed, TF will not automatically delete it with the current provider version! It must be removed manually from the App Service -> Networking blade!
    ip_restriction {
      virtual_network_subnet_id = var.lb_subnet_id
      action                    = "Allow"
    }
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
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
    always_on                         = "true"
    health_check_path                 = "/actuator/health"
    health_check_eviction_time_in_min = 5
    scm_minimum_tls_version           = "1.2"
    use_32_bit_worker                 = false
    ftps_state                        = "Disabled"
    vnet_route_all_enabled            = false
    ip_restriction_default_action     = "Deny" # Should use behavior set in the ip_restriction
    scm_ip_restriction_default_action = "Deny" # We don't use Kudu or the SCM site tools

    # This application stack is what we use to deploy the docker image to the staging slot
    # After it becomes healthy, we swap the staging slot with the production slot to complete the deployment
    application_stack {
      docker_image_name        = "${var.docker_image_name}:${var.docker_image_tag}"
      docker_registry_url      = "https://${data.terraform_remote_state.global.outputs.acr_simeplereport_name}.azurecr.io"
      docker_registry_username = data.terraform_remote_state.global.outputs.acr_simeplereport_name
      docker_registry_password = data.terraform_remote_state.global.outputs.acr_simeplereport_admin_password
    }

    // NOTE: If this code is removed, TF will not automatically delete it with the current provider version! It must be removed manually from the App Service -> Networking blade!
    ip_restriction {
      virtual_network_subnet_id = var.lb_subnet_id
      action                    = "Allow"
    }
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
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
  key_vault_secret_id = data.azurerm_key_vault_certificate.wildcard_simplereport_gov.secret_id
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
