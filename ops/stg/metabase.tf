module "metabase_database" {
  source = "../services/metabase/database"

  postgres_server_id = data.terraform_remote_state.persistent_stg.outputs.postgres_server_id
}
