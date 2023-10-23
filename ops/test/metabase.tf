module "metabase_database" {
  source = "../services/metabase/database"

  postgres_server_id = data.terraform_remote_state.persistent_test.outputs.postgres_server_id
}

module "metabase_service" {
  source = "../services/metabase/service"
  name   = "${local.project}-${local.name}-${local.env}-metabase"
  env    = local.env

  postgres_admin_username    = data.azurerm_key_vault_secret.postgres_user.value
  postgres_admin_password    = data.azurerm_key_vault_secret.postgres_password.value
  postgres_metabase_username = data.azurerm_key_vault_secret.postgres_nophi_user.value
  postgres_metabase_password = data.azurerm_key_vault_secret.postgres_nophi_password.value

  resource_group_location = data.azurerm_resource_group.rg.location
  resource_group_name     = data.azurerm_resource_group.rg.name

  service_plan_id        = module.simple_report_api.service_plan_id
  webapp_subnet_id       = data.terraform_remote_state.persistent_test.outputs.subnet_webapp_id
  ai_instrumentation_key = data.terraform_remote_state.persistent_test.outputs.app_insights_instrumentation_key
  key_vault_id           = data.azurerm_key_vault.sr_global.id
  tenant_id              = data.azurerm_client_config.current.tenant_id

  postgres_server_name = data.terraform_remote_state.persistent_test.outputs.postgres_server_name
  postgres_url         = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.metabase_db_uri.id})"
  postgres_server_fqdn = data.terraform_remote_state.persistent_test.outputs.postgres_server_fqdn

  lb_subnet_id = data.terraform_remote_state.persistent_test.outputs.subnet_lbs_id

  metabase_url = "https://${local.env}.simplereport.gov/metabase/"

  depends_on = [
    module.metabase_database
  ]
}
