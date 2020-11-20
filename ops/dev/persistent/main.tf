provider "azurerm" {
  version = "~>2.0"
  features {}
  skip_provider_registration = true
}

locals {
  management_tags = {
    prime-app = "simplereport"
    environment = "development"
  }
  diag_db_logs = [
    "PostgreSQLLogs"
  ]

  diag_db_metrics = [
    "AllMetrics"
  ]
}

data "azurerm_log_analytics_workspace" "law" {
  name = var.log_analytics_name
  resource_group_name = var.resource_group
}

data "azurerm_resource_group" "rg" {
  name = var.resource_group
}

resource "azurerm_postgresql_server" "db" {
  name = "sr-db-dev"
  location = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  sku_name = "GP_Gen5_4"
  version = "11"
  ssl_enforcement_enabled = false
  administrator_login = "simple_report_app"
  administrator_login_password = "H@Sh1CoR3!"
  public_network_access_enabled = true

  tags = local.management_tags
}

resource "azurerm_postgresql_database" "simple_report" {
  charset = "UTF8"
  collation = "English_United States.1252"
  name = "simple_report"
  resource_group_name = var.resource_group
  server_name = azurerm_postgresql_server.db.name
}

# These parameters and names need to be exact: https://github.com/MicrosoftDocs/azure-docs/issues/20758
resource "azurerm_postgresql_firewall_rule" "all" {
  name = "AllowAllAzureIps"
  resource_group_name = var.resource_group
  server_name = azurerm_postgresql_server.db.name
  start_ip_address = "0.0.0.0"
  end_ip_address = "0.0.0.0"
}


resource "azurerm_monitor_diagnostic_setting" "backend-db" {
  name = "sr-dev-db-diag"
  target_resource_id = azurerm_postgresql_server.db.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.law.id

  dynamic "log" {
    for_each = local.diag_db_logs
    content {
      category = log.value

      retention_policy {
        enabled = false
      }
    }
  }

  dynamic "metric" {
    for_each = local.diag_db_metrics
    content {
      category = metric.value

      retention_policy {
        enabled = false
      }
    }
  }
}
