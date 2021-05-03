module "simple_report_api" {
  source = "../services/app_service"
  name   = "${local.name}-api"
  env    = local.env

  instance_count = 2

  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  webapp_subnet_id = data.terraform_remote_state.persistent_dev.outputs.subnet_webapp_id

  docker_image_uri = "DOCKER|simplereportacr.azurecr.io/api/simple-report-api-build:${var.acr_image_tag}"
  key_vault_id     = data.azurerm_key_vault.sr_global.id
  tenant_id        = data.azurerm_client_config.current.tenant_id
  https_only       = true

  deploy_info = {
    env           = "dev",
    time          = var.deploy_timestamp,
    tag           = var.deploy_tag,
    workflow_name = var.deploy_workflow,
    workflow_run  = var.deploy_runnumber,
    by            = var.deploy_actor
  }

  app_settings = {
    SPRING_PROFILES_ACTIVE                = "azure-dev"
    SPRING_DATASOURCE_URL                 = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.sr_dev_db_jdbc.id})"
    APPLICATIONINSIGHTS_CONNECTION_STRING = data.azurerm_application_insights.app_insights.connection_string
    DATAHUB_API_KEY                       = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.datahub_api_key.id})"
    SECRET_SLACK_NOTIFY_WEBHOOK_URL       = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.slack_notify_webhook_url.id})"
    OKTA_OAUTH2_CLIENT_SECRET             = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.okta_client_secret.id})"
    OKTA_API_KEY                          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.okta_api_key.id})"
    TWILIO_ACCOUNT_SID                    = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.twilio_account_sid.id})"
    TWILIO_AUTH_TOKEN                     = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.twilio_auth_token.id})"
    SIMPLE_REPORT_SENDGRID_API_KEY        = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.sendgrid_api_key.id})"
    SMARTY_AUTH_ID                        = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.smarty_auth_id.id})"
    SMARTY_AUTH_TOKEN                     = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.smarty_auth_token.id})"
    # true by default: can be disabled quickly here
    # SPRING_LIQUIBASE_ENABLED                       = "true"
    # this shadows (and overrides) an identical declaration in application.yaml
    # SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA = "public"
  }
}
