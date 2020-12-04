variable "docker_tag" {
  description = "Docker tag to deploy"
  type        = string
  default     = "1ba237a"
}

variable "env" {
  default = "dev"
}

variable "application_name" {
  default = "prime-simple-report"
}