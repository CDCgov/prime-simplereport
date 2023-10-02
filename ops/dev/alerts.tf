module "metric_alerts" {
  source                         = "../services/alerts/app_service_metrics"
  env                            = local.env
  app_insights_id                = data.azurerm_application_insights.app_insights.id
  service_plan_id                = module.simple_report_api.service_plan_id
  app_service_id                 = module.simple_report_api.app_service_id
  rg_name                        = data.azurerm_resource_group.rg.name
  tags                           = local.management_tags
  http_response_time_aggregation = "Minimum"
  disabled_alerts = [
    "cpu_util",
    "mem_util",
    "http_2xx_failed_requests",
    "http_4xx_errors",
    "http_401_410_errors",
    "http_5xx_errors",
    "first_error_in_a_week",
    "account_request_failures",
    "experian_auth_failures",
    "frontend_error_boundary",
    "db_query_duration_over_time_window",
    "db_connection_exhaustion",
    "batched_uploader_single_failure_detected",
    "batched_uploader_function_not_triggering",
    "fhir_batched_uploader_single_failure_detected",
    "fhir_batched_uploader_function_not_triggering",
    "function_app_memory_alert",
    "fhir_function_app_duration_alert"
  ]

  action_group_ids = [
    data.terraform_remote_state.global.outputs.pagerduty_non_prod_action_id
  ]
  function_id = module.report_stream_reporting_functions.azurerm_linux_function_app_id

  database_id = data.terraform_remote_state.persistent_dev.outputs.postgres_server_id
  cdc_tags    = local.cdc_tags
}
