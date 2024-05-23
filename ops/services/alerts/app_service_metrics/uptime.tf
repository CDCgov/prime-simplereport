locals {
  geo_locations = [
    "us-va-ash-azr",   // East US
    "us-ca-sjc-azr",   // West US
    "us-il-ch1-azr",   // North Central US
    "us-tx-sn1-azr",   // South Central US
    "apac-jp-kaw-edge" // Japan (Guam)
  ]

  url_prefix = var.env == "prod" ? "www" : var.env

  base_url_map = {
    "${var.env}-simplereport-gov"     = "https://${local.url_prefix}.simplereport.gov/",
    "${var.env}-simplereport-gov-api" = "https://${local.url_prefix}.simplereport.gov/api/actuator/health",
    "${var.env}-simplereport-gov-app" = "https://${local.url_prefix}.simplereport.gov/app/health/ping"
  }

  full_url_map = merge(
    local.base_url_map,
    var.additional_uptime_test_urls
  )
}

resource "azurerm_application_insights_web_test" "uptime" {
  for_each = local.full_url_map

  name                    = each.key
  description             = "Verify the URL is publicly available"
  location                = var.rg_location
  resource_group_name     = var.rg_name
  application_insights_id = var.app_insights_id
  retry_enabled           = true
  frequency               = 300
  timeout                 = 30
  geo_locations           = local.geo_locations
  kind                    = "ping"
  enabled                 = contains(var.disabled_alerts, "uptime") ? false : true

  // Borrowed from https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/application_insights_web_test#example-usage
  configuration = <<XML
<WebTest Name="WebTest1" Id="" Enabled="True" CssProjectStructure="" CssIteration="" Timeout="30" WorkItemIds="" xmlns="http://microsoft.com/schemas/VisualStudio/TeamTest/2010" Description="" CredentialUserName="" CredentialPassword="" PreAuthenticate="True" Proxy="default" StopOnError="False" RecordedResultFile="" ResultsLocale="">
  <Items>
    <Request Method="GET" Guid="" Version="1.1" Url="${each.value}" ThinkTime="0" Timeout="30" FollowRedirects="True" RecordResult="True" Cache="False" ResponseTimeGoal="0" Encoding="utf-8" ExpectedHttpStatusCode="200" ExpectedResponseUrl="" ReportingName="" IgnoreHttpStatusCode="False" />
  </Items>
</WebTest>
XML

  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}

resource "azurerm_monitor_metric_alert" "uptime" {
  for_each = local.base_url_map

  name                = "uptime-${each.key}"
  description         = "${each.key} is not responding"
  resource_group_name = var.rg_name
  scopes              = [azurerm_application_insights_web_test.uptime[each.key].id, var.app_insights_id]
  frequency           = "PT1M"
  window_size         = "PT5M"
  severity            = var.severity
  enabled             = contains(var.disabled_alerts, "uptime") ? false : true

  application_insights_web_test_location_availability_criteria {
    web_test_id           = azurerm_application_insights_web_test.uptime[each.key].id
    component_id          = var.app_insights_id
    failed_location_count = 3
  }

  dynamic "action" {
    for_each = var.action_group_ids
    content {
      action_group_id    = action.value
      webhook_properties = var.wiki_docs_json
    }
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}

resource "azurerm_monitor_metric_alert" "uptime_redirects" {
  for_each = var.additional_uptime_test_urls

  name                = "uptime_redirects-${each.key}"
  description         = "${each.key} is not responding"
  resource_group_name = var.rg_name
  scopes              = [azurerm_application_insights_web_test.uptime[each.key].id, var.app_insights_id]
  frequency           = "PT1M"
  window_size         = "PT15M"
  severity            = var.severity
  enabled             = contains(var.disabled_alerts, "uptime_redirects") ? false : true

  application_insights_web_test_location_availability_criteria {
    web_test_id           = azurerm_application_insights_web_test.uptime[each.key].id
    component_id          = var.app_insights_id
    failed_location_count = 3
  }

  dynamic "action" {
    for_each = var.action_group_ids
    content {
      action_group_id    = action.value
      webhook_properties = var.wiki_docs_json
    }
  }
  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}
