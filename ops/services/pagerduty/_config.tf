terraform {
  required_providers {
    pagerduty = {
      source  = "pagerduty/pagerduty"
      version = "~> 3.4"
    }
  }
  required_version = "~> 1.3.3"
}
