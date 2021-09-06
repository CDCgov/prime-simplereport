module "metric_alerts" {
  source                         = "../services/alerts/app_service_metrics"
  env                            = local.env
  app_insights_id                = data.azurerm_application_insights.app_insights.id
  app_service_plan_id            = module.simple_report_api.app_service_plan_id
  app_service_id                 = module.simple_report_api.app_service_id
  rg_name                        = data.azurerm_resource_group.rg.name
  tags                           = local.management_tags
  http_response_time_aggregation = "Minimum"
  disabled_alerts = [
    "cpu_util",
    "mem_util",
    "http_2xx_failed_requests",
    "http_4xx_errors",
    "http_5xx_errors",
    "first_error_in_a_week",
    "account_request_failures",
    "frontend_error_boundary",
    "db_query_duration",
    "db_query_duration_over_time_window",
  ]

  action_group_ids = [
    data.terraform_remote_state.global.outputs.pagerduty_non_prod_action_id
  ]


  mem_threshold = 85
  cpu_threshold = 85
}
