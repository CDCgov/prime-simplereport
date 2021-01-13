resource "azurerm_monitor_metric_alert" "backend_health" {
  name                = "${var.env}-backend-health"
  description         = "${var.env} backend services are unhealthy"
  resource_group_name = var.resource_group_name
  scopes              = [azurerm_application_gateway.load_balancer.id]
  severity            = local.is_prod ? 1 : 3
  criteria {
    aggregation      = "Average"
    metric_name      = "UnhealthyHostCount"
    metric_namespace = "Microsoft.Network/applicationGateways"
    operator         = "GreaterThan"
    threshold        = 0

    dimension {
      name     = "BackendSettingsPool"
      operator = "Include"
      values = [
        "${local.api_backend_pool}~${local.api_backend_https_setting}"
      ]
    }
  }

  action {
    action_group_id = var.action_group_id
  }
}

resource "azurerm_monitor_metric_alert" "fronted_health" {
  name                = "${var.env}-frontend-health"
  description         = "Alert which fires whenever the static website becomes unavailable"
  resource_group_name = var.resource_group_name
  scopes              = [azurerm_application_gateway.load_balancer.id]
  severity            = local.is_prod ? 1 : 3
  criteria {
    aggregation      = "Average"
    metric_name      = "UnhealthyHostCount"
    metric_namespace = "Microsoft.Network/applicationGateways"
    operator         = "GreaterThan"
    threshold        = 0

    dimension {
      name     = "BackendSettingsPool"
      operator = "Include"
      values = [
        "${local.static_backend_pool}~${local.static_backend_https_setting}"
      ]
    }
  }

  action {
    action_group_id = var.action_group_id
  }
}
