
resource "pagerduty_service_integration" "az" {
  name    = "Terraformed Integration"
  service = data.pagerduty_service.service.id
  vendor  = data.pagerduty_vendor.azure.id
}

resource "azurerm_monitor_action_group" "pd" {
  name                = data.pagerduty_service.service.name
  short_name          = var.action_group_short_name
  resource_group_name = var.resource_group_name

  webhook_receiver {
    name                    = "PagerDuty - ${data.pagerduty_service.service.name}"
    service_uri             = "https://events.pagerduty.com/integration/${pagerduty_service_integration.az.integration_key}/enqueue"
    use_common_alert_schema = true
  }
}