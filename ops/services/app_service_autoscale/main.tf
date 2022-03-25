resource "azurerm_monitor_autoscale_setting" "simplereport_autoscale" {
  name                = "prime-simple-report-appserviceplan-${var.env}-Autoscale"
  resource_group_name = var.resource_group_name
  location            = var.resource_group_location
  target_resource_id  = var.target_resource_id
  profile {
    name = "Peak Hours"
    capacity {
      default = var.peak_capacity_instances
      minimum = var.peak_capacity_instances
      maximum = var.peak_capacity_instances
    }
    recurrence {
      timezone = "Eastern Standard Time"
      days     = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      hours    = [0]
      minutes  = [0]
    }
  }
  profile {
    name = "Weekends"
    capacity {
      default = var.weekend_capacity_instances
      minimum = var.weekend_capacity_instances
      maximum = var.weekend_capacity_instances
    }
    recurrence {
      timezone = "Eastern Standard Time"
      days     = ["Saturday", "Sunday"]
      hours    = [0]
      minutes  = [0]
    }
  }
}