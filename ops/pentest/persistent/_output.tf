output "vnet_id" {
  value = module.vnet.network.id
}

output "subnet_lbs_id" {
  value = module.vnet.subnet_lbs_id
}

output "subnet_webapp_id" {
  value = module.vnet.subnet_webapp_id
}

output "app_insight_id" {
  value = module.monitoring.app_insights_id
}

output "app_insights_instrumentation_key" {
  value     = module.monitoring.app_insights_instrumentation_key
  sensitive = true
}

output "postgres_server_name" {
  value = module.db.server_name
}

output "postgres_server_fqdn" {
  value = module.db.server_fqdn
}

output "postgres_server_id" {
  value = module.db.server_id
}

output "subnet_container_instances_id" {
  value = module.vnet.subnet_container_instances_id
}
