# Forwards alerts to slack
module "alerting" {
  source           = "../services/app_functions/slack_forwarding"
  rg_location      = data.azurerm_resource_group.rg.location
  rg_name          = data.azurerm_resource_group.rg.name
  function_app     = "definitions.json"
  storage_account  = local.storage_account_name
  key_vault_id     = azurerm_key_vault.sr.id
  app_insights_key = module.insights.app_insights_instrumentation_key
  log_workspace_id = module.insights.log_analytics_workspace_id
}




# Ping tests
//module "simplereport_cdc_gov" {
//  source          = "../services/alerts/url_ping_test"
//  name            = "simplereport.cdc.gov"
//  test_url        = "https://simplereport.cdc.gov"
//  action_group_id = module.alerting.monitor_group_id
//
//  app_insight_id = module.insights.app_insights_id
//  rg_location    = data.azurerm_resource_group.rg.location
//  rg_name        = data.azurerm_resource_group.rg.name
//
//  tags = local.management_tags
//}