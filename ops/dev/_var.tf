variable "docker_tag" {
  description = "Docker tag to deploy"
  type        = string
  default     = "1ba237a"
}

variable "acr_image_tag" {
  description = "Simple report Api ACR tag to deploy"
  type        = string
}

variable "env" {
  default = "dev"
}