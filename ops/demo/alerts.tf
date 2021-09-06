module "metric_alerts" {
  source                         = "../services/alerts/app_service_metrics"
  env                            = local.env
  app_insights_id                = data.azurerm_application_insights.app_insights.id
  app_service_plan_id            = module.simple_report_api.app_service_plan_id
  app_service_id                 = module.simple_report_api.app_service_id
  severity                       = 1
  rg_name                        = data.azurerm_resource_group.rg.name
  tags                           = local.management_tags
  mem_threshold                  = 85
  cpu_window_size                = "PT1H"
  http_response_time_aggregation = "Minimum"
  skip_on_weekends               = true
  disabled_alerts = [
    "frontend_error_boundary",
  ]

  action_group_ids = [
    data.terraform_remote_state.global.outputs.pagerduty_non_prod_action_id
  ]

}
