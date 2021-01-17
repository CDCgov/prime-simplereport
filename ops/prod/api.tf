module "simple_report_api" {
  source = "../services/app_service"
  name   = "${local.name}-api"
  env    = local.env

  instance_tier  = "PremiumV2"
  instance_size  = "P1v2"
  instance_count = 1

  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  docker_image_uri = "DOCKER|simplereportacr.azurecr.io/api/simple-report-api-build:${var.acr_image_tag}"
  key_vault_id     = data.azurerm_key_vault.global.id
  tenant_id        = data.azurerm_client_config.current.tenant_id
  https_only       = true

  app_settings = {
    SPRING_PROFILES_ACTIVE                         = "azure-prod"
    SPRING_LIQUIBASE_ENABLED                       = "true"
    SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA = "public"
    SPRING_DATASOURCE_URL                          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.sr_db_jdbc.id})"
    OKTA_OAUTH2_CLIENT_SECRET                      = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.okta_client_secret.id})"
    APPLICATIONINSIGHTS_CONNECTION_STRING          = "InstrumentationKey=${data.azurerm_application_insights.app_insights.instrumentation_key};IngestionEndpoint=https://eastus-1.in.applicationinsights.azure.com/"
    DATAHUB_API_KEY                                = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.datahub_api_key.id})"
    SECRET_SLACK_NOTIFY_WEBHOOK_URL                = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.slack_notify_webhook_url.id})"
    ORG_FACILITY_NAME                              = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.org_facility_name.id})"
    ORG_EXTERNAL_ID                                = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.org_external_id.id})"
    ORG_CLIA_NUMBER                                = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.org_clia_number.id})"
  }
}
