module "db_liquibase_action" {
  source                  = "../services/container_instances/db_liquibase_action"
  count                   = var.image_action == null ? 0 : 1
  name                    = local.name
  env                     = local.env
  resource_group_name     = data.azurerm_resource_group.rg.name
  resource_group_location = data.azurerm_resource_group.rg.location
  acr_password            = data.terraform_remote_state.global.outputs.acr_simeplereport_admin_password
  rollback_tag            = var.liquibase_rollback_tag
  image_action            = var.image_action
  spring_datasource_url   = data.azurerm_key_vault_secret.sr_dev7_db_jdbc.value
  subnet_id               = data.terraform_remote_state.persistent_dev7.outputs.subnet_container_instances_id
}

module "db_client" {
  source                  = "../services/container_instances/db_client/infra"
  count                   = 1
  name                    = local.name
  env                     = local.env
  resource_group_name     = data.azurerm_resource_group.rg.name
  resource_group_location = data.azurerm_resource_group.rg.location
  docker_image_tag        = var.acr_image_tag
  acr_password            = data.terraform_remote_state.global.outputs.acr_simeplereport_admin_password
  subnet_id               = data.terraform_remote_state.persistent_dev7.outputs.subnet_container_instances_id
}