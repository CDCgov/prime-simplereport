module "simple_report_api" {
  source    = "../services/app_service"
  name      = "${local.name}-api"
  env       = local.env
  env_index = 4

  instance_count = 1

  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  webapp_subnet_id = data.terraform_remote_state.persistent_dev4.outputs.subnet_webapp_id
  lb_subnet_id     = data.terraform_remote_state.persistent_dev4.outputs.subnet_lbs_id

  docker_image_name = "simplereportacr.azurecr.io/api/simple-report-api-build"
  docker_image_tag  = var.acr_image_tag

  key_vault_id = data.azurerm_key_vault.sr_global.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  https_only   = true

  deploy_info = {
    env           = "dev4",
    time          = var.deploy_timestamp,
    tag           = var.deploy_tag,
    workflow_name = var.deploy_workflow,
    workflow_run  = var.deploy_runnumber,
    by            = var.deploy_actor
  }

  app_settings = {
    SPRING_PROFILES_ACTIVE                        = "azure-dev4"
    SPRING_DATASOURCE_SIMPLEREPORT_HIKARI_JDBCURL = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.sr_dev4_db_jdbc.id})"
    SPRING_DATASOURCE_METABASE_HIKARI_JDBCURL     = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.metabase_db_uri.id})"
    DB_PASSWORD_NO_PHI                            = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.db_password_no_phi.id})"
    APPLICATIONINSIGHTS_CONNECTION_STRING         = data.azurerm_application_insights.app_insights.connection_string
    AZ_REPORTING_QUEUE_CXN_STRING                 = data.azurerm_storage_account.app.primary_connection_string
    OKTA_OAUTH2_CLIENT_SECRET                     = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.okta_client_secret.id})"
    OKTA_API_KEY                                  = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.okta_api_key_nonprod.id})"
    TWILIO_ACCOUNT_SID                            = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.twilio_account_sid.id})"
    TWILIO_AUTH_TOKEN                             = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.twilio_auth_token.id})"
    TWILIO_MESSAGING_SID                          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.twilio_messaging_sid.id})"
    SIMPLE_REPORT_SENDGRID_API_KEY                = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.sendgrid_api_key.id})"
    SMARTY_AUTH_ID                                = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.smarty_auth_id.id})"
    SMARTY_AUTH_TOKEN                             = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.smarty_auth_token.id})"
    EXPERIAN_TOKEN_ENDPOINT                       = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_token_endpoint.id})"
    EXPERIAN_INITIAL_REQUEST_ENDPOINT             = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_initial_request_endpoint.id})"
    EXPERIAN_DOMAIN                               = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_domain.id})"
    EXPERIAN_CLIENT_ID                            = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_client_id.id})"
    EXPERIAN_CLIENT_SECRET                        = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_client_secret.id})"
    EXPERIAN_CC_SUBSCRIBER_SUBCODE                = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_crosscore_subscriber_subcode.id})"
    EXPERIAN_CC_USERNAME                          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_crosscore_username.id})"
    EXPERIAN_CC_PASSWORD                          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_crosscore_password.id})"
    EXPERIAN_PID_TENANT_ID                        = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_preciseid_tenant_id.id})"
    EXPERIAN_PID_CLIENT_REFERENCE_ID              = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_preciseid_client_reference_id.id})"
    EXPERIAN_PID_USERNAME                         = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_preciseid_username.id})"
    EXPERIAN_PID_PASSWORD                         = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.experian_preciseid_password.id})"
    RS_QUEUE_CALLBACK_TOKEN                       = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.report_stream_exception_callback_token.id})"
    DATAHUB_URL                                   = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.datahub_url.id})"
    DATAHUB_API_KEY                               = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.datahub_api_key.id})"
    DATAHUB_FHIR_KEY                              = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.datahub_fhir_key.id})"
    DATAHUB_SIGNING_KEY                           = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.datahub_signing_key.id})"
    SR_PROD_BACKEND_URL                           = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.simple_report_prod_backend_url.id})"
    SR_PROD_DEVICES_TOKEN                         = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.simple_report_prod_devices_token.id})"
    # true by default: can be disabled quickly here
    # SPRING_LIQUIBASE_ENABLED                       = "true"
    # this shadows (and overrides) an identical declaration in application.yaml
    # SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA = "public"
  }
}

module "report_stream_reporting_functions" {
  source       = "../services/app_functions/report_stream_batched_publisher/infra"
  environment  = local.env
  env_level    = local.env_level
  tenant_id    = data.azurerm_client_config.current.tenant_id
  lb_subnet_id = data.terraform_remote_state.persistent_dev4.outputs.subnet_lbs_id
  depends_on = [
    azurerm_storage_account.app
  ]
}
