locals {
  project   = "prime"
  name      = "simple-report"
  env       = "dev6"
  env_level = "dev"

  network_cidr = "10.1.0.0/16"
  rg_name      = data.azurerm_resource_group.dev6.name
  rg_location  = data.azurerm_resource_group.dev6.location
  management_tags = {
    prime-app   = "simple-report"
    environment = local.env
    # Resource groups can support multiple environments at the same level. Any resources that are shared between
    # environments should use the "local.env_level" convention where possible.
    resource_group = "${local.project}-${local.name}-${local.env_level}"
  }
}

module "monitoring" {
  source        = "../../services/monitoring"
  env           = local.env
  management_rg = data.azurerm_resource_group.global.name
  rg_location   = local.rg_location
  rg_name       = local.rg_name

  app_url = "${local.env}.simplereport.gov"

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
  env_level   = local.env_level
  rg_location = local.rg_location
  rg_name     = local.rg_name

  global_vault_id     = data.azurerm_key_vault.global.id
  db_vault_id         = data.azurerm_key_vault.db_keys.id
  subnet_id           = module.vnet.subnet_db_id
  log_workspace_id    = module.monitoring.log_analytics_workspace_id
  private_dns_zone_id = module.vnet.private_dns_zone_id

  nophi_user_password = random_password.random_nophi_password.result

  tags = local.management_tags
}

module "db_alerting" {
  source  = "../../services/alerts/db_metrics"
  env     = local.env
  rg_name = local.rg_name
  db_id   = module.db.server_id
  action_group_ids = [
    data.terraform_remote_state.global.outputs.pagerduty_non_prod_action_id
  ]
}

module "vnet" {
  source              = "../../services/virtual_network"
  env                 = local.env
  env_level           = local.env_level
  resource_group_name = local.rg_name
  network_address     = local.network_cidr
  management_tags     = local.management_tags
  location            = local.rg_location
}
