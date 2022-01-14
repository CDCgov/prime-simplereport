locals {
  project = "prime"
  name    = "simple-report"
  env     = "prod"

  network_cidr = "10.5.0.0/16"
  rg_location  = data.azurerm_resource_group.prod.location
  rg_name      = data.azurerm_resource_group.prod.name


  management_tags = {
    prime-app      = "simplereport"
    environment    = local.env
    resource_group = "${local.project}-${local.name}-${local.env}"
  }
}

module "monitoring" {
  source        = "../../services/monitoring"
  env           = local.env
  management_rg = data.azurerm_resource_group.global.name
  rg_location   = local.rg_location
  rg_name       = local.rg_name

  app_url = "${local.env}.simplereport.gov"

  ai_ingest_cap_gb = 200

  tags = local.management_tags
}

module "bastion" {
  source = "../../services/bastion_host"
  env    = local.env

  resource_group_location = local.rg_location
  resource_group_name     = local.rg_name

  virtual_network = module.vnet.network

  tags = local.management_tags
}

resource "random_password" "random_nophi_password" {
  length           = 30
  special          = false
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

module "db" {
  source      = "../../services/postgres_db"
  env         = local.env
  rg_location = local.rg_location
  rg_name     = local.rg_name

  global_vault_id      = data.azurerm_key_vault.global.id
  db_vault_id          = data.azurerm_key_vault.db_keys.id
  db_encryption_key_id = data.azurerm_key_vault_key.db_encryption_key.id
  subnet_id            = module.vnet.subnet_vm_id
  dns_zone_id          = module.vnet.private_dns_zone_id
  administrator_login  = "simplereport"
  log_workspace_id     = module.monitoring.log_analytics_workspace_id
  nophi_user_password  = random_password.random_nophi_password.result

  tags = local.management_tags
}

module "vnet" {
  source              = "../../services/virtual_network"
  env                 = local.env
  resource_group_name = local.rg_name
  network_address     = local.network_cidr
  management_tags     = local.management_tags
  location            = local.rg_location
}
