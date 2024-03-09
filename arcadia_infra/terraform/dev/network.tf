//# VPC
//resource "google_compute_network" "vpc" {
//  name                    = "dev-vpc"
//  project                 = var.project_id
//  auto_create_subnetworks = false
//  mtu                     = 1460
//}
//
//# Subnet for VPCConnector
//resource "google_compute_subnetwork" "subnet-vpc-connector" {
//  name          = "subnet-vpc-connector"
//  project       = var.project_id
//  region        = var.region
//  ip_cidr_range = "10.100.0.0/28"
//  network       = google_compute_network.vpc.id
//}
//
//# Private IP Address for VPC Connection
//resource "google_compute_global_address" "private-ip-address-vpc-connection" {
//  name          = "private-ip-address-vpc-connection"
//  purpose       = "VPC_PEERING"
//  address_type  = "INTERNAL"
//  prefix_length = 16
//  network       = google_compute_network.vpc.id
//}
//
//# VPC Connection
//resource "google_service_networking_connection" "private-vpc-connection" {
//  network                 = google_compute_network.vpc.id
//  service                 = "servicenetworking.googleapis.com"
//  reserved_peering_ranges = [google_compute_global_address.private-ip-address-vpc-connection.name]
//}
//
//# VPC Access Connector
//resource "google_vpc_access_connector" "vpc-access-connector" {
//  provider = google-beta
//  name   = "vpc-access-connector"
//  subnet {
//    name = google_compute_subnetwork.subnet-vpc-connector.name
//  }
//}