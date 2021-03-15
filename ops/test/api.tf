module "simple_report_api" {
  source = "../services/app_service"
  name   = "${local.name}-api"
  env    = local.env

  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  docker_image_uri = "DOCKER|simplereportacr.azurecr.io/api/simple-report-api-build:${var.acr_image_tag}"
  key_vault_id     = data.azurerm_key_vault.sr_global.id
  tenant_id        = data.azurerm_client_config.current.tenant_id
  https_only       = true

  app_settings = {
    SPRING_PROFILES_ACTIVE                         = "azure-test"
    SPRING_LIQUIBASE_ENABLED                       = "true"
    SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA = "public"
    SPRING_DATASOURCE_URL                          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.sr_db_jdbc.id})"
    DATAHUB_API_KEY                                = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.datahub_api_key.id})"
    SECRET_SLACK_NOTIFY_WEBHOOK_URL                = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.slack_notify_webhook_url.id})"
    OKTA_OAUTH2_CLIENT_SECRET                      = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.okta_client_secret.id})"
    OKTA_API_KEY                                   = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.okta_api_key.id})"
    APPLICATIONINSIGHTS_CONNECTION_STRING          = "InstrumentationKey=${data.azurerm_application_insights.app_insights.instrumentation_key};IngestionEndpoint=https://eastus-1.in.applicationinsights.azure.com/"
    TWILIO_ACCOUNT_SID                             = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.twilio_account_sid.id})"
    TWILIO_AUTH_TOKEN                              = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.twilio_auth_token.id})"
    SIMPLE_REPORT_SENDGRID_API_KEY                 = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.sendgrid_api_key.id})"
    SMARTY_AUTH_ID                                 = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.smarty_auth_id.id})"
    SMARTY_AUTH_TOKEN                              = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.smarty_auth_token.id})"
  }
}
