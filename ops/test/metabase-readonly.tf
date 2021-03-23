module "metabase-readonly" {
    source = "../services/app_service/metabase-readonly"
    name   = "${local.project}-${local.name}-${local.env}-metabase-readonly"
    env    = local.env

    resource_group_location = data.azurerm_resource_group.rg.location
    resource_group_name     = data.azurerm_resource_group.rg.name

    app_service_plan_id     = module.simple_report_api.app_service_plan_id
    webapp_subnet_id        = data.terraform_remote_state.persistent_test.outputs.subnet_webapp_id
    ai_instrumentation_key  = data.terraform_remote_state.persistent_test.outputs.app_insights_instrumentation_key
    key_vault_id            = data.azurerm_key_vault.sr_global.id
    tenant_id               = data.azurerm_client_config.current.tenant_id

    postgres_server_name    = data.terraform_remote_state.persistent_test.outputs.postgres_server_name
    postgres_port           = 5432
    postgres_db_name        = "simple_report"
}