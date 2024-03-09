# Variable settings

variable "organization_id" {
  default = "893170155253"
}

# GCP ProjectID
variable "project_id" {
  default = "arcadia-dev-416707"
}

# GCP location
variable "location" {
  default = "asia-northeast1"
}

# GCP region
variable "region" {
  default = "asia-northeast1"
}

# GCP zone
variable "zone" {
  default = "asia-northeast1-a"
}

# Github Repository
variable "github_repository" {
  default = "yugokamo/arcadia"
}

# WebApi container image
variable "container_image_webapi" {
  default = "yugokamo/arcadia"
}