locals {
  project = "prime"
  name    = "simple-report"
  env     = "demo"
  management_tags = {
    prime-app      = "simple-report"
    environment    = local.env
    resource_group = "${local.project}-${local.name}-${local.env}"
  }
}


module "monitoring" {
  source        = "../../services/monitoring"
  env           = local.env
  management_rg = data.azurerm_resource_group.rg_global.name
  rg_location   = data.azurerm_resource_group.demo.location
  rg_name       = data.azurerm_resource_group.demo.name

  app_url = "${local.env}.simeplreport.gov"

  tags = local.management_tags
}

module "db" {
  source      = "../../services/postgres_db"
  env         = local.env
  rg_location = data.azurerm_resource_group.demo.location
  rg_name     = data.azurerm_resource_group.demo.name

  global_vault_id      = data.azurerm_key_vault.global.id
  db_vault_id          = data.azurerm_key_vault.db_keys.id
  db_encryption_key_id = data.azurerm_key_vault_key.db_encryption_key.id

  log_workspace_id = module.monitoring.log_analytics_workspace_id

  tags = local.management_tags
}