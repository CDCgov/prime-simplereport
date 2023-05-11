variable "acr_image_tag" {
  description = "Simple report Api ACR tag to deploy"
  type        = string
}

variable "deploy_timestamp" {
  description = "The current date and time"
  type        = string
  default     = ""
}

variable "deploy_tag" {
  description = "The branch or tag that we are deploying"
  type        = string
  default     = ""
}

variable "deploy_workflow" {
  description = "The name of the workflow performing the deploy"
  type        = string
  default     = "N/A"
}

variable "deploy_runnumber" {
  description = "The run number of the deploy workflow"
  type        = number
  default     = -1
}

variable "deploy_actor" {
  description = "The ID of the person performing the release"
  type        = string
  default     = ""
}

variable "liquibase_rollback_tag" {
  description = "If defined, attempt to roll DB back to this tag"
  type        = string
  default     = null
}

variable "image_action" {
  description = "The liquibase action to perform"
  type        = string
  default     = null
}
