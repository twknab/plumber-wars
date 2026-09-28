# Host Plumber Wars on Google Cloud Run

This serves the built Phaser game at a public HTTPS `run.app` URL (the live game also answers at a custom domain via a Cloud Run domain mapping). Game saves stay in each visitor's browser; the only server-side data is the leaderboard in Firestore (`(default)` database), which this Terraform does not create. Defaults are Oregon (`us-west1`), zero minimum instances, three maximum instances, 1 CPU and 256 MiB RAM per instance. Registry storage and Cloud Run usage can incur charges; the instance limit is not a billing cap.

## First deployment

Prerequisites: an existing GCP project with billing enabled, Terraform >=1.6, Docker with a running daemon and Buildx, and Google Cloud CLI. The deploying identity needs access to enable project services, administer Artifact Registry/Cloud Run, create a service account, and act as that runtime account. The runtime itself gets no project roles.

Authenticate locally (do not put credentials in this repo):

```sh
gcloud auth login
gcloud auth application-default login
```

From the repository root:

```sh
bash deploy/cloud-run.sh YOUR_PROJECT_ID us-west1
```

The script shows Terraform's plans and asks for approval before each apply. It first enables APIs and creates the private image registry. Then it builds a Linux AMD64 image, pushes it, resolves its immutable digest, and provisions the public Cloud Run service. The last output is the playable public URL. Later deployments use the same command and existing state.

The two small Terraform roots deliberately avoid the first-deploy dependency trap: Cloud Run cannot start until the container has been pushed. No placeholder public service or targeted Terraform apply is needed.

## Manual operation

Each Terraform root has a `terraform.tfvars.example`. Copy to `terraform.tfvars`, fill in project/region (and the real immutable image digest for `service`), then use `terraform init`, `terraform plan`, and `terraform apply` in that folder. Create `bootstrap` first, push the image using `docker buildx build --platform linux/amd64`, then apply `service`.

Terraform state is local by default and excluded from Git. Keep both state files backed up; use separate GCS backend prefixes for each root before collaborating or deploying from CI. Do not delete state or change project/region casually between runs. Commit generated `.terraform.lock.hcl` files for repeatable provider versions.

## Verify

```sh
GAME_URL="$(terraform -chdir=infra/service output -raw public_url)"
curl --fail "$GAME_URL/health"
```

Open the URL on an actual phone in landscape. Verify character choice, driving controls, repair timing, pause/background/resume, retries, and continued saved progress. HTTPS supports normal mobile-browser play; this is not yet a Steam package or native mobile app.

## Public access

`invoker_iam_disabled = true` makes the service public without requiring every player to log in. This follows [Cloud Run's public access guidance](https://docs.cloud.google.com/run/docs/authenticating/public). If your organization requires invoker IAM checks or restricts ingress, an administrator must permit the intended public service; do not bypass organization policy.

## Remove deployment

After reviewing the destroy plan, destroy `infra/service` first, then `infra/bootstrap`. The service has deletion protection disabled for this demo. Destroying bootstrap removes the game image repository; enabled shared project APIs intentionally remain enabled. Keep Terraform variable values available when running destroy.

## Validation boundary

Local formatting/schema checks are recorded in the project verification notes. Live GCP deployment, billing, IAM and public URL reachability are not confirmed until an actual project is supplied and deployment succeeds.
