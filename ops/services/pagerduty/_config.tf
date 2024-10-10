terraform {
  required_providers {
    pagerduty = {
      source  = "pagerduty/pagerduty"
      version = "~> 2.14"
    }
  }
  required_version = "~> 1.9.6"
}
