resource "google_artifact_registry_repository" "cloud-run-service-webapi" {
  location      = var.location
  repository_id = "cloud-run-service-webapi"
  description   = "arcadia docker repository for webapi cloud run"
  format        = "DOCKER"
}

resource "google_artifact_registry_repository_iam_member" "iam-member-arcadia-dev-container-repository" {
  provider = google-beta
  location  = var.location
  repository = google_artifact_registry_repository.cloud-run-service-webapi.name
  role   = "roles/artifactregistry.admin"
  member = "serviceAccount:${google_service_account.sa-github-actions.email}"
}