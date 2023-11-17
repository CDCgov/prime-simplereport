terraform {
  required_providers {
    pagerduty = {
      source  = "pagerduty/pagerduty"
      version = "~> 3.1"
    }
  }
  required_version = "~> 1.3.3"
}
