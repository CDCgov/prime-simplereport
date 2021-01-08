variable "infra_team" {
  description = "Object Ids for the infra team"
  type        = list(string)
}

variable "slack_webhook" {
  description = "Slack webhook for posting notifications"
  type        = string
}
