
resource "azurerm_application_insights_web_test" "web_test" {
  name                    = var.name
  location                = var.rg_location
  resource_group_name     = var.rg_name
  application_insights_id = var.app_insight_id
  retry_enabled           = true
  frequency               = 300
  timeout                 = 5
  enabled                 = var.enabled
  geo_locations = [
    "us-tx-sn1-azr",
    "us-il-ch1-azr"
  ]
  kind        = "ping"
  description = "Verify the URL is publically available"

  configuration = <<XML
<WebTest Name="WebTest1" Id="ABD48585-0831-40CB-9069-682EA6BB3583" Enabled="True" CssProjectStructure="" CssIteration="" Timeout="0" WorkItemIds="" xmlns="http://microsoft.com/schemas/VisualStudio/TeamTest/2010" Description="" CredentialUserName="" CredentialPassword="" PreAuthenticate="True" Proxy="default" StopOnError="False" RecordedResultFile="" ResultsLocale="">
  <Items>
    <Request Method="GET" Guid="a5f10126-e4cd-570d-961c-cea43999a200" Version="1.1" Url="${var.test_url}" ThinkTime="0" Timeout="300" ParseDependentRequests="True" FollowRedirects="True" RecordResult="True" Cache="False" ResponseTimeGoal="0" Encoding="utf-8" ExpectedHttpStatusCode="200" ExpectedResponseUrl="" ReportingName="" IgnoreHttpStatusCode="False" />
  </Items>
</WebTest>
XML


  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}

resource "azurerm_monitor_metric_alert" "webtest" {
  name                = "${var.name}-ping"
  description         = "${var.name} is unavailable"
  resource_group_name = var.rg_name
  scopes              = [azurerm_application_insights_web_test.web_test.id, var.app_insight_id]
  severity            = var.severity
  enabled             = true

  application_insights_web_test_location_availability_criteria {
    web_test_id           = azurerm_application_insights_web_test.web_test.id
    component_id          = var.app_insight_id
    failed_location_count = 1
  }

  criteria {
    aggregation      = "Sum"
    metric_name      = "Failed Location"
    metric_namespace = ""
    operator         = "GreaterThan"
    threshold        = 1
  }

  action {
    action_group_id = var.action_group_id
  }
}
