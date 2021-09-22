variable "prefix" {
  type    = string
  default = "reportstream-batched-publisher"
}

variable "location" {
  type    = string
  default = "eastus"
}

variable "environment" {
  type = string
}

variable "resource_group_name_prefix" {
  type    = string
  default = "prime-simple-report-"
}

variable "function_app_source" {
  type    = string
  default = "./functions/build/batched-rs-publisher.zip"
}

variable "test_event_queue_name" {
  type    = string
  default = "test-event-publishing"
}
