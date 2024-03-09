# GCP Provider settings
terraform {
  required_version = "~>v1.1"
  required_providers {
    google = {
      version = "~>4.34.0"
      source  = "hashicorp/google"
    }
    google-beta = {
      version = "~>4.34.0"
      source  = "hashicorp/google-beta"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# GCS bucket configuration for storing terraform tfstate file
terraform {
  backend "gcs" {
    bucket = "arcadia-tfstate-bucket"
    prefix = "terraform/state"
  }
}

