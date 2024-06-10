Innbyggerkontakt prod is not defined here, but is created manually in gcp.

The yml files are [build config files](https://cloud.google.com/build/docs/build-config-file-schema). And the terraform files in /terraform
defines triggers and couple up what folders should be build with what tools.

This would be much simpler if we split up in different repos.

pre-commit-builder and poetry-publisher are both custom images to test with pre-commit and build with poetry. You can define a step with one of these builders in a config file with `- name: 'gcr.io/${PROJECT_ID}/poetry'`.

# Terraform apply
Only one instance of terraform apply can run at the same time. To force this terraform sets a lock on the state file in cloud storage.
When terraform is done it will release this lock. But if terraform_apply cloud build times out it will never release the state lock.
To fix this issue you must get the state_lock_id from a failed terraform_apply, then create and run terraform_release_state_lock manually
with the current state_lock_id. Then you can invoke terraform_apply again.


# Update terraform version
To update terraform version you need to update and release the Dockerfile/image manually with name "gcr.io/$PROJECT_ID/deployment".
