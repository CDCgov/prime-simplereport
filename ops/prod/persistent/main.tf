locals {
  project = "prime"
  name    = "simple-report"
  env     = "prod"
  management_tags = {
    prime-app      = "simplereport"
    environment    = local.env
    resource_group = "${local.project}-${local.name}-${local.env}"
  }
}

module "all" {
  source = "../../services/all-persistent"
  env    = local.management_tags.environment
}

module "monitoring" {
  source        = "../../services/monitoring"
  env           = local.env
  management_rg = data.azurerm_resource_group.global.name
  rg_location   = data.azurerm_resource_group.prod.location
  rg_name       = data.azurerm_resource_group.prod.name

  app_url = "${local.env}.simeplreport.gov"

  tags = local.management_tags
}

module "bastion" {
  source = "../../services/bastion_host"
  env    = local.env

  resource_group_location = data.azurerm_resource_group.prod.location
  resource_group_name     = data.azurerm_resource_group.prod.name

  virtual_network_name = "${local.name}-${local.env}-network"
  subnet_cidr          = ["10.5.253.0/27"]

  tags = local.management_tags
}

module "psql_connect" {
  source                  = "../../services/basic_vm"
  name                    = "psql-connect"
  env                     = local.env
  resource_group_location = data.azurerm_resource_group.prod.location
  resource_group_name     = data.azurerm_resource_group.prod.name

  subnet_id                = azurerm_subnet.vms.id
  bastion_connect_password = data.azurerm_key_vault_secret.psql_connect_password.value

  tags = local.management_tags
}


module "db" {
  source      = "../../services/postgres_db"
  env         = local.env
  rg_location = data.azurerm_resource_group.prod.location
  rg_name     = data.azurerm_resource_group.prod.name

  global_vault_id      = data.azurerm_key_vault.global.id
  db_vault_id          = data.azurerm_key_vault.db_keys.id
  db_encryption_key_id = data.azurerm_key_vault_key.db_encryption_key.id
  public_access        = false
  administrator_login  = "simplereport"

  log_workspace_id = module.monitoring.log_analytics_workspace_id

  tags = local.management_tags
}