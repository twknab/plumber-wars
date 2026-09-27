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
  type        = string
  description = "Existing project initialized by ../bootstrap."
}

variable "region" {
  type    = string
  default = "us-west1"
}

variable "image" {
  type        = string
  description = "Previously pushed game image; use an immutable sha256 digest."
  validation {
    condition     = can(regex("@sha256:[a-f0-9]{64}$", var.image))
    error_message = "Provide an immutable image URL ending in @sha256:<64 hex characters>."
  }
}

variable "max_instances" {
  type    = number
  default = 3
  validation {
    condition     = var.max_instances >= 1 && var.max_instances <= 10 && floor(var.max_instances) == var.max_instances
    error_message = "Choose an integer between 1 and 10."
  }
}

resource "google_service_account" "game" {
  account_id   = "plumber-wars-runtime"
  display_name = "Plumber Wars static game runtime"
  # Static files need no project IAM roles or credentials.
}

resource "google_cloud_run_v2_service" "game" {
  name                 = "plumber-wars"
  location             = var.region
  deletion_protection  = false
  ingress              = "INGRESS_TRAFFIC_ALL"
  invoker_iam_disabled = true

  template {
    service_account                  = google_service_account.game.email
    max_instance_request_concurrency = 80
    timeout                          = "60s"

    scaling {
      min_instance_count = 0
      max_instance_count = var.max_instances
    }

    containers {
      image = var.image
      ports {
        container_port = 8080
      }
      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
        cpu_idle          = true
        startup_cpu_boost = false
      }
      startup_probe {
        initial_delay_seconds = 0
        timeout_seconds       = 1
        period_seconds        = 3
        failure_threshold     = 10
        http_get {
          path = "/health"
          port = 8080
        }
      }
    }
  }
}

output "public_url" {
  description = "Open this HTTPS URL on a phone or desktop to play."
  value       = google_cloud_run_v2_service.game.uri
}
