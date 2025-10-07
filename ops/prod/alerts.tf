module "metric_alerts" {
  source          = "../services/alerts/app_service_metrics"
  env             = local.env
  app_insights_id = data.azurerm_application_insights.app_insights.id
  service_plan_id = module.simple_report_api.service_plan_id
  app_service_id  = module.simple_report_api.app_service_id
  severity        = 1
  rg_name         = data.azurerm_resource_group.rg.name
  tags            = local.management_tags

  // Add additional tests for the following special case redirects:
  // simplereport.gov     -> www.simplereport.gov
  // simplereport.cdc.gov -> www.simplereport.gov
  additional_uptime_test_urls = {
    "${local.env}-simplereport-gov-www-redirect" = "https://simplereport.gov/",
    "${local.env}-simplereport-gov-cdc-redirect" = "https://simplereport.cdc.gov/",
  }

  mem_threshold = 80

  disabled_alerts = [
    "mem_util"
  ]

  action_group_ids = [
    data.terraform_remote_state.global.outputs.pagerduty_prod_action_id
  ]
  function_id = module.report_stream_reporting_functions.azurerm_linux_function_app_id

  database_id = data.terraform_remote_state.persistent_prod.outputs.postgres_server_id
}
