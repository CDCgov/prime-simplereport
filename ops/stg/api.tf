module "simple_report_api" {
  source = "../services/app_service"
  name   = "${local.name}-api"
  env    = local.env

  instance_count = 3
  instance_size  = "P2v2"

  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  webapp_subnet_id = data.terraform_remote_state.persistent_stg.outputs.subnet_webapp_id

  docker_image_uri = "DOCKER|simplereportacr.azurecr.io/api/simple-report-api-build:${var.acr_image_tag}"
  key_vault_id     = data.azurerm_key_vault.global.id
  tenant_id        = data.azurerm_client_config.current.tenant_id
  https_only       = true

  deploy_info = {
    env           = "stg",
    time          = var.deploy_timestamp,
    tag           = var.deploy_tag,
    workflow_name = var.deploy_workflow,
    workflow_run  = var.deploy_runnumber,
    by            = var.deploy_actor
  }

  app_settings = {
    SPRING_PROFILES_ACTIVE                     = "azure-stg"
    SPRING_DATASOURCE_URL                      = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.sr_db_jdbc.id})"
    SPRING_DATASOURCE_HIKARI_MAXIMUM-POOL-SIZE = 10
    OKTA_OAUTH2_CLIENT_SECRET                  = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.okta_client_secret.id})"
    APPLICATIONINSIGHTS_CONNECTION_STRING      = data.azurerm_application_insights.app_insights.connection_string
    OKTA_API_KEY                               = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.okta_api_key.id})"
    ORG_FACILITY_NAME                          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.org_facility_name.id})"
    ORG_EXTERNAL_ID                            = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.org_external_id.id})"
    ORG_CLIA_NUMBER                            = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.org_clia_number.id})"
    TWILIO_ACCOUNT_SID                         = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.twilio_account_sid.id})"
    TWILIO_AUTH_TOKEN                          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.twilio_auth_token.id})"
    SIMPLE_REPORT_SENDGRID_API_KEY             = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.sendgrid_api_key.id})"
    SMARTY_AUTH_ID                             = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.smarty_auth_id.id})"
    SMARTY_AUTH_TOKEN                          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.smarty_auth_token.id})"
    EXPERIAN_TOKEN_ENDPOINT                    = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_token_endpoint.id})"
    EXPERIAN_INITIAL_REQUEST_ENDPOINT          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_initial_request_endpoint.id})"
    EXPERIAN_DOMAIN                            = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_domain.id})"
    EXPERIAN_CLIENT_ID                         = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_client_id.id})"
    EXPERIAN_CLIENT_SECRET                     = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_client_secret.id})"
    EXPERIAN_CC_SUBSCRIBER_SUBCODE             = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_crosscore_subscriber_subcode.id})"
    EXPERIAN_CC_USERNAME                       = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_crosscore_username.id})"
    EXPERIAN_CC_PASSWORD                       = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_crosscore_password.id})"
    EXPERIAN_PID_TENANT_ID                     = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_preciseid_tenant_id.id})"
    EXPERIAN_PID_CLIENT_REFERENCE_ID           = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_preciseid_client_reference_id.id})"
    EXPERIAN_PID_USERNAME                      = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_preciseid_username.id})"
    EXPERIAN_PID_PASSWORD                      = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_preciseid_password.id})"
    # true by default: can be disabled quickly here
    # SPRING_LIQUIBASE_ENABLED                       = "true"
    # this shadows (and overrides) an identical declaration in application.yaml
    # SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA = "public"
  }
}
