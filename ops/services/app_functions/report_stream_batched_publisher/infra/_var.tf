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

variable "env_level" {
  description = "Pipeline level that this environment is a member of."
  type        = string
}

# Secret Access
variable "tenant_id" {}

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

variable "publishing_error_queue_name" {
  type    = string
  default = "test-event-publishing-error"
}

variable "reporting_exception_queue_name" {
  type    = string
  default = "test-event-publishing-exceptions"
}

variable "test_event_queue_name_fhir" {
  type    = string
  default = "fhir_data_queue"
}

variable "reporting_exception_queue_name_fhir" {
  type    = string
  default = "fhir_data_exceptions_queue"
}

variable "report_stream_batch_minimum" {
  type    = string
  default = "1"
}

variable "report_stream_batch_maximum" {
  type    = string
  default = "300"
}

variable "lb_subnet_id" {}
