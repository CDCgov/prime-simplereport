variable "prefix" {
  type    = string
  default = "reportstream-batched-publisher"
}

variable "location" {
  type    = string
  default = "eastus"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "resource_group" {
  type    = string
  default = "prime-simple-report-dev"
}

variable "function_app_source" {
  type    = string
  default = "./functions/build/batched-rs-publisher.zip"
}

variable "storage_account_name" {
  type    = string
  default = "simplereportdevapp"
}

variable "storage_account_key" {
  type = string
}

variable "storage_account_primary_connection_string" {
  type = string
}

variable "test_event_queue_name" {
    type = string
}

variable "report_stream_url" {
    type = string
}

variable "report_stream_token" {
    type = string
}

variable "app_insights_instrumentation_key" {
    type = string
}