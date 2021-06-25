module "metric_alerts" {
  source                         = "../services/alerts/app_service_metrics"
  env                            = local.env
  app_insights_id                = data.azurerm_application_insights.app_insights.id
  app_service_plan_id            = module.simple_report_api.app_service_plan_id
  app_service_id                 = module.simple_report_api.app_service_id
  rg_name                        = data.azurerm_resource_group.rg.name
  tags                           = local.management_tags
  mem_threshold                  = 85
  cpu_window_size                = 15
  http_response_time_aggregation = "Minimum"

  action_group_ids = [
    data.terraform_remote_state.global.outputs.pagerduty_demo_action_id
  ]
}
