provider "azurerm" {
  version = "~>2.0"
  features {}
  skip_provider_registration = true
}

provider "okta" {
  org_name = "prime-eval"
  base_url = "okta.com"
}

locals {
  management_tags = {
    prime-app = "simplereport"
    environment = "test"
  }
  env = "test"
}

data "azurerm_resource_group" "rg" {
  name = "prime-simple-report-test"
}

data "azurerm_key_vault" "kv" {
  name = "simple-report-global"
  resource_group_name = data.azurerm_resource_group.rg.name
}

data "azurerm_log_analytics_workspace" "law" {
  name = "simple-report-log-workspace-global"
  resource_group_name = data.azurerm_resource_group.rg.name
}

data "azurerm_virtual_network" "vn" {
  name = "simple-report-${local.env}-network"
  resource_group_name = data.azurerm_resource_group.rg.name
}

data "azurerm_postgresql_server" "db" {
  name = "simple-report-${local.env}-db"
  resource_group_name = data.azurerm_resource_group.rg.name
}

module "backend" {
  source = "../services/backend"
  container_id = "nickrobisonusds/sr-backend:0605f1c"
  db_dns_name = data.azurerm_postgresql_server.db.fqdn
  db_server_name = data.azurerm_postgresql_server.db.name
  db_name = "simple_report"
  db_username = "simple_report_app"
  env = local.env
  key_vault_id = data.azurerm_key_vault.kv.id
  log_workspace_id = data.azurerm_log_analytics_workspace.law.workspace_id
  log_workspace_uri = data.azurerm_log_analytics_workspace.law.id
  log_workspace_key = data.azurerm_log_analytics_workspace.law.primary_shared_key
  network_name = data.azurerm_virtual_network.vn.name
  rg_location = data.azurerm_resource_group.rg.location
  rg_name = data.azurerm_resource_group.rg.name
  tags = local.management_tags
}

module "frontend" {
  source = "../services/frontend"
  env = local.env
  rg_location = data.azurerm_resource_group.rg.location
  rg_name = data.azurerm_resource_group.rg.name
  tags = local.management_tags
}


// Okta application
module "okta" {
  source = "../services/okta-app"
  env = local.env
}
