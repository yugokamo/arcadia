
# Initial setup

## Setup terraform account
### Enable gcloud services
```bash
gcloud services enable \
		iamcredentials.googleapis.com \
		iam.googleapis.com \
		run.googleapis.com \
		artifactregistry.googleapis.com \
		storage-component.googleapis.com \
		cloudresourcemanager.googleapis.com \
		servicenetworking.googleapis.com \
		vpcaccess.googleapis.com \
		sqladmin.googleapis.com
```

### Create tfstate bucket
```bash
gsutil mb gs://arcadia-tfstate-bucket
```

### Create terraform service account
```bash
gcloud iam service-accounts create terraform-serviceaccount
```

### Add IAM policy binding to terraform service account
```bash
gcloud projects add-iam-policy-binding arcadia-dev-416707 \
  --member serviceAccount:terraform-serviceaccount@arcadia-dev-416707.iam.gserviceaccount.com \
  --role roles/owner
```
TODO: Terraformサービスアカウントの権限は後々絞り込む

### Create credential file for terraform service account
```bash
gcloud iam service-accounts keys create ~/.gcp/keys/arcadia-dev-terraform-service-account.json \
  --iam-account terraform-serviceaccount@arcadia-dev-416707.iam.gserviceaccount.com
```

### Setup credential key path
```bash
export GOOGLE_CLOUD_KEYFILE_JSON=~/.gcp/keys/arcadia-dev-terraform-service-account.json
```

## Init terraform
```bash
cd terraform/dev
terraform init
```
