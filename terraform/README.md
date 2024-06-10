# Terraform
[![](https://img.shields.io/badge/Terraform-a?style=flat&logo=terraform&label=IaC&color=7B42BC&logoColor=ffffff)](https://www.terraform.io/)

Terraform state is configured and stored in their respective project opposed to what Terraform recommends.
This is why we have innbyggerkontakt-dev.tfbackend and innbyggerkontakt.tfbackend (GCLOUD_PROJECT.tfbackend)

The Terraform state is synchronized and locked in the project's Google Cloud Storage bucket named `"project-name"-terraform-state`.

## Setup
Install terraform, version can be found in version.tf. https://learn.hashicorp.com/tutorials/terraform/install-cli

Install Python dependencies by writing the following into a terminal:
```bash
pip install -r requirements.txt
```

To initialize Terraform:
```bash
terraform init -reconfigure -backend-config=innbyggerkontakt-dev.tfbackend
```
Run:
```bash
terraform plan -var 'project_id=innbyggerkontakt-dev'
```
to verify installation. This example is for the development environment.

## Deploy
Numerous resources are deployed through Terraform. Terraform will zip Cloud Function and deploy function if hash is different.
Cloud Run resources are deployed once through Terraform when they are first created. This is to use the gcloud cli for faster deployment.

> PS! As of now, to archive (zip) **some** Cloud Functions, a Python script named `zip_files.py` is used. However, later in the development Terraform provided a simple solution to archive source code, `archive_file`. Future development should use these solutions since a custom script is prone to errors and a waste of time. An example for the use of `archive_file` can be seen inside `cloud-function2.tf`.

To apply Terraform changes, run
```bash
terraform apply -var 'project_id=$PROJECT_ID'
```

## Production
In order to deploy updates to resources in production, deployment must be done manually in `Cloud Build` in the [console](https://console.cloud.google.com/) of the production project.

Inside `Cloud Build`, select `Triggers` in the left navigation list. Run the following triggers by clicking on the `Run` button at the end of the row.

1. Release-packages-source
2. Release-deployment-image
3. Terraform-apply-master
4. Deploy-admin
5. Deploy-outcome
6. Deploy-recipients

This should apply all the changes in the source code and changes in the Terraform files.
