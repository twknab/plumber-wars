terraform {
  required_version = ">= 1.6, < 2.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "Existing GCP project with billing enabled."
  type        = string
}

variable "region" {
  description = "Region for the game and its image repository."
  type        = string
  default     = "us-west1"
}

resource "google_project_service" "apis" {
  for_each           = toset(["run.googleapis.com", "artifactregistry.googleapis.com", "iam.googleapis.com"])
  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "game" {
  location      = var.region
  repository_id = "plumber-wars"
  description   = "Plumber Wars game container images"
  format        = "DOCKER"
  depends_on    = [google_project_service.apis]
}

output "repository_url" {
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.game.repository_id}"
  description = "Push the linux/amd64 game container here before applying the service stack."
}
