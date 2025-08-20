# external state
data "terraform_remote_state" "persistent_dev5" {
  backend = "azurerm"
  config = {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "dev5/persistent-terraform.tfstate"
  }
}

data "terraform_remote_state" "global" {
  backend = "azurerm"
  config = {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "global/terraform.tfstate"
  }
}

# Resource Groups
data "azurerm_resource_group" "rg" {
  # Environments are assembled into shared resource groups by environment level.
  name = "${local.project}-${local.name}-${local.env_level}"
}

data "azurerm_resource_group" "rg_global" {
  name = "${local.project}-${local.name}-management"
}

data "azurerm_resource_group" "rg_prod" {
  name = "${local.project}-${local.name}-prod"
}

data "azurerm_client_config" "current" {}

# Network
data "azurerm_virtual_network" "dev5" {
  name                = "simple-report-${local.env}-network"
  resource_group_name = data.azurerm_resource_group.rg.name
}

# Secrets
data "azurerm_key_vault" "sr_global" {
  name                = "simple-report-global"
  resource_group_name = data.azurerm_resource_group.rg_global.name
}

data "azurerm_key_vault_secret" "sr_dev5_db_jdbc" {
  name         = "simple-report-${local.env}-db-jdbc"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "metabase_db_uri" {
  name         = "simple-report-${local.env}-db-metabase-uri"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "postgres_user" {
  name         = "simple-report-${local.env}-db-username"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "postgres_password" {
  name         = "simple-report-${local.env}-db-password"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "postgres_nophi_user" {
  name         = "simple-report-${local.env}-db-username-no-phi"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "postgres_nophi_password" {
  name         = "simple-report-${local.env}-db-password-no-phi"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "okta_api_key" {
  name         = "okta-api-key"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "okta_api_key_nonprod" {
  name         = "okta-api-key-nonprod"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "okta_client_id" {
  key_vault_id = data.azurerm_key_vault.sr_global.id
  name         = "okta-${local.env}-client-id"
}

data "azurerm_key_vault_secret" "okta_client_secret" {
  key_vault_id = data.azurerm_key_vault.sr_global.id
  name         = "okta-${local.env}-client-secret"
}

data "azurerm_key_vault_secret" "twilio_account_sid" {
  name         = "twilio-account-sid"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "twilio_auth_token" {
  name         = "twilio-auth-token"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "twilio_messaging_sid" {
  name         = "twilio-messaging-sid"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "sendgrid_api_key" {
  name         = "sendgrid-dev-api-key"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "smarty_auth_id" {
  name         = "smarty-auth-id"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "smarty_auth_token" {
  name         = "smarty-auth-token"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "experian_token_endpoint" {
  name         = "experian-token-endpoint-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "experian_initial_request_endpoint" {
  name         = "experian-initial-request-endpoint-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "experian_domain" {
  name         = "experian-domain-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "experian_client_id" {
  name         = "experian-client-id-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "experian_client_secret" {
  name         = "experian-client-secret-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "experian_crosscore_subscriber_subcode" {
  name         = "experian-crosscore-subscriber-subcode-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "experian_crosscore_username" {
  name         = "experian-crosscore-username-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "experian_crosscore_password" {
  name         = "experian-crosscore-password-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "experian_preciseid_tenant_id" {
  name         = "experian-preciseid-tenant-id-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "experian_preciseid_client_reference_id" {
  name         = "experian-preciseid-client-reference-id-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "experian_preciseid_username" {
  name         = "experian-preciseid-username-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "experian_preciseid_password" {
  name         = "experian-preciseid-password-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "report_stream_exception_callback_token" {
  name         = "report-stream-exception-callback-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

# logs
data "azurerm_log_analytics_workspace" "log_analytics" {
  name                = "simple-report-log-workspace-global"
  resource_group_name = data.azurerm_resource_group.rg_global.name
}

data "azurerm_application_insights" "app_insights" {
  name                = "prime-simple-report-${local.env}-insights"
  resource_group_name = data.azurerm_resource_group.rg.name
}

data "azurerm_storage_account" "app" {
  name                = "simplereport${local.env}app"
  resource_group_name = data.azurerm_resource_group.rg.name
  depends_on = [
    azurerm_storage_account.app
  ]
}

data "azurerm_key_vault_secret" "db_password_no_phi" {
  name         = "simple-report-${local.env}-db-password-no-phi"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "datahub_api_key" {
  name         = "datahub-api-key-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "datahub_fhir_key" {
  name         = "datahub-fhir-key-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "datahub_url" {
  name         = "datahub-url-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "datahub_signing_key" {
  name         = "datahub-signing-key-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "simple_report_prod_backend_url" {
  name         = "simple-report-prod-backend-url"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "simple_report_prod_devices_token" {
  name         = "simple-report-prod-devices-token"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "aphl_tes_api_key" {
  name         = "aphl-tes-api-key-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "loinc_fhir_api_username" {
  name         = "loinc-fhir-api-username-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "loinc_fhir_api_password" {
  name         = "loinc-fhir-api-password-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "umls_api_key" {
  name         = "umls-api-key-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "aims_access_key_id" {
  name         = "aims-access-key-id-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "aims_secret_access_key" {
  name         = "aims-secret-access-key-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "aims_kms_encryption_key" {
  name         = "aims-kms-encryption-key-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "aims_outbound_storage_endpoint" {
  name         = "aims-outbound-storage-endpoint-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "aims_message_queue_endpoint" {
  name         = "aims-message-queue-endpoint-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "aims_user_id" {
  name         = "aims-user-id-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "aims_environment" {
  name         = "aims-environment-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "aims_bucket_name" {
  name         = "aims-outbound-storage-bucket-name-${local.token_env_suffix}"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}