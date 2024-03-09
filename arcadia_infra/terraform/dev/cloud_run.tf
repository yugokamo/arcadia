//resource "google_cloud_run_service" "cloud-run-service-webapi" {
//  name     = "cloud-run-service-webapi"
//  location = var.location
//  autogenerate_revision_name = true
//  template {
//    spec {
//      containers {
//        image = var.container_image_webapi
//      }
//    }
//  }
//}
//
//output "url" {
//  value = google_cloud_run_service.cloud-run-service-webapi.status[0].url
//}