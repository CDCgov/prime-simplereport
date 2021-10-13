module "metric_alerts" {
  source              = "../services/alerts/app_service_metrics"
  env                 = local.env
  app_insights_id     = data.azurerm_application_insights.app_insights.id
  app_service_plan_id = module.simple_report_api.app_service_plan_id
  app_service_id      = module.simple_report_api.app_service_id
  rg_name             = data.azurerm_resource_group.rg.name
  tags                = local.management_tags
  disabled_alerts = [
    "http_2xx_failed_requests",
    "http_4xx_errors",
    "http_401_410_errors",
    "http_5xx_errors",
    "first_error_in_a_week",
    "account_request_failures",
    "frontend_error_boundary",
  ]

  action_group_ids = [
    data.terraform_remote_state.global.outputs.pagerduty_prod_action_id
  ]

}
