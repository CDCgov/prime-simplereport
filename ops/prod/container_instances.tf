module "db_liquibase_action" {
  # Only create this resource if we're actually doing a rollback
  count = var.liquibase_rollback_tag == null ? 0 : 1

  source                  = "../services/container_instances/db_liquibase_action"
  name                    = local.name
  env                     = local.env
  resource_group_name     = data.azurerm_resource_group.rg.name
  resource_group_location = data.azurerm_resource_group.rg.location
  acr_password            = data.terraform_remote_state.global.outputs.acr_simeplereport_admin_password
  rollback_tag            = var.liquibase_rollback_tag
  image_action            = var.image_action
  spring_datasource_url   = data.azurerm_key_vault_secret.sr_db_jdbc.value
  subnet_id               = data.terraform_remote_state.persistent_prod.outputs.subnet_container_instances_id
}