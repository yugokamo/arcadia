
resource "google_iam_workload_identity_pool" "wip-github" {
  provider                  = google-beta
  project                   = var.project_id
  workload_identity_pool_id = "wip-github"
  display_name              = "wip-github"
  description               = "Workload Identity Pool for GitHub Actions"
}

resource "google_iam_workload_identity_pool_provider" "wip-provider-github" {
  provider                           = google-beta
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.wip-github.workload_identity_pool_id
  workload_identity_pool_provider_id = "wip-provider-github"
  display_name                       = "github actions provider"
  description                        = "OIDC identity pool provider for execute github actions"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.owner"      = "assertion.repository_owner"
    "attribute.refs"       = "assertion.ref"
  }

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}