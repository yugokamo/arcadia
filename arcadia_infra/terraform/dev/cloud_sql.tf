# SQL Instance
//resource "google_sql_database_instance" "dev-mysql-instance" {
//  name             = "dev-mysql-instance"
//  region           = var.region
//  database_version = "MYSQL_8_0"
//
//  depends_on = [
//    google_service_networking_connection.private-vpc-connection
//  ]
//
//  settings {
//    tier = "db-f1-micro"
//    ip_configuration {
//      # public ip disable
//      ipv4_enabled    = false
//      private_network = google_compute_network.vpc.id
//    }
//  }
//
//  deletion_protection = "true"
//}