data "pagerduty_service" "service" {
  name = var.pagerduty_service_name
}

data "pagerduty_vendor" "azure" {
  name = "Microsoft Azure"
}

data "pagerduty_vendor" "twilio" {
  name = "Twilio"
}
