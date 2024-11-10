terraform {
  required_providers {
    pagerduty = {
      source  = "pagerduty/pagerduty"
      version = "~> 3.17"
    }
  }
  required_version = "~> 1.9.6"
}
