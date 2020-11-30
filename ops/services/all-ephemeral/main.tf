locals {
  management_tags = {
    prime-app = "simplereport"
    environment = var.env
  }
  management_rg = "prime-simple-report-test"
}


data "azurerm_resource_group" "rg" {
  name = "prime-simple-report-${var.env}"
}

data "azurerm_key_vault" "kv" {
  name = "simple-report-global"
  resource_group_name = local.management_rg
}

data "azurerm_log_analytics_workspace" "law" {
  name = "simple-report-log-workspace-global"
  resource_group_name = local.management_rg
}

data "azurerm_virtual_network" "vn" {
  name = "simple-report-${var.env}-network"
  resource_group_name = data.azurerm_resource_group.rg.name
}

data "azurerm_postgresql_server" "db" {
  name = "simple-report-${var.env}-db"
  resource_group_name = data.azurerm_resource_group.rg.name
}

module "backend" {
  source = "../backend"
  container_id = "nickrobisonusds/sr-backend:${var.docker_tag}"
  db_dns_name = data.azurerm_postgresql_server.db.fqdn
  db_server_name = data.azurerm_postgresql_server.db.name
  db_name = "simple_report"
  db_username = "simple_report_app"
  env = var.env
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
  source = "../frontend"
  env = var.env
  rg_location = data.azurerm_resource_group.rg.location
  rg_name = data.azurerm_resource_group.rg.name
  tags = local.management_tags
}


// Setup DNS for backend Gateway
data "azurerm_dns_zone" "sr" {
  resource_group_name = "prime-simple-report-prod"
  name = "simplereport.org"
}

resource "azurerm_dns_a_record" "backend" {
  name = "api.${var.env}"
  resource_group_name = "prime-simple-report-prod"
  ttl = 300
  zone_name = data.azurerm_dns_zone.sr.name
  records = [module.backend.gateway_ip]
}

resource "azurerm_dns_cname_record" "frontend" {
  name = var.env
  resource_group_name = "prime-simple-report-prod"
  ttl = 300
  zone_name = data.azurerm_dns_zone.sr.name
  record = module.frontend.blob_ip_address
}
