
resource "google_service_account" "sa-github-actions" {
  project      = var.project_id
  account_id   = "sa-github-actions"
  display_name = "service account for GitHub Actions"
  description  = "Link to Workload Identity Pool used by github actions"
}

resource "google_project_iam_member" "iam-member-github-actions" {
  project = var.project_id
  member              = "serviceAccount:${google_service_account.sa-github-actions.email}"
  for_each = toset([
    "roles/run.admin",
    "roles/iam.serviceAccountUser"
  ])
  role                = each.key
}

resource "google_service_account_iam_member" "iam-member-sa-github-actions-wiu" {
  service_account_id  = google_service_account.sa-github-actions.name
  member              = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.wip-github.name}/attribute.repository/${var.github_repository}"
  role                = "roles/iam.workloadIdentityUser"
}

output "service_account_github_actions_email" {
  description = "github account for github actions"
  value       = google_service_account.sa-github-actions.email
}

output "google_iam_workload_identity_pool_provider_github_name" {
  description = "Workload Identity Pood Provider ID"
  value       = google_iam_workload_identity_pool_provider.wip-provider-github.name
}