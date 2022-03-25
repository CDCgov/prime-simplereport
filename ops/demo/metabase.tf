module "metabase_database" {
  source = "../services/metabase/database"

  resource_group_name  = data.azurerm_resource_group.rg.name
  postgres_server_name = data.terraform_remote_state.persistent_demo.outputs.postgres_server_name
}
