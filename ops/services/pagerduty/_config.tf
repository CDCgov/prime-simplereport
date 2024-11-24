terraform {
  required_providers {
    pagerduty = {
      source  = "pagerduty/pagerduty"
      version = "~> 3.18"
    }
  }
  required_version = "~> 1.9.6"
}
