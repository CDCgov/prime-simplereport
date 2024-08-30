# variable "rg_name" {
#   description = "Name of resource group to deploy into"
#   type        = string
#   default     = "prime-simple-report-pentest"
# }
#
# variable "rg_location" {
#   description = "Location of resource group to deploy into"
#   type        = string
#   default     = "eastus"
# }
#
# variable "global_vault" {
#
# }
#
# variable "channel" {
#   default     = "project-sr-on-call-alerts"
#   description = "The Slack channel that the alerts are sent to."
# }
#
#
# variable "connection_name" {
#   type        = string
#   description = "This connection must be manually activated in the Azure Console after deployment to test other will have to wait for Alert Group to trigger it"
#   default     = "slack"
# }
#
# variable "logicAppName" {
#   default = "Slack-Integration-Workflow"
#
# }