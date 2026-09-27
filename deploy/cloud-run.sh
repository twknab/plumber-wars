#!/usr/bin/env bash
set -euo pipefail

# Usage: bash deploy/cloud-run.sh YOUR_PROJECT_ID [us-west1]
# Terraform asks for confirmation for each real infrastructure change.
project_id="${1:?Usage: bash deploy/cloud-run.sh PROJECT_ID [REGION]}"
region="${2:-us-west1}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

for tool in terraform gcloud docker; do
  command -v "$tool" >/dev/null || { echo "Install $tool first." >&2; exit 1; }
done
docker info >/dev/null

terraform -chdir=infra/bootstrap init
terraform -chdir=infra/bootstrap apply -var="project_id=$project_id" -var="region=$region"
repository_url="$(terraform -chdir=infra/bootstrap output -raw repository_url)"
image_tag="$repository_url/game:$(date -u +%Y%m%d%H%M%S)"

gcloud auth configure-docker "$region-docker.pkg.dev"
docker buildx build --platform linux/amd64 --tag "$image_tag" --push .
image_digest="$(gcloud artifacts docker images describe "$image_tag" --project="$project_id" --format='value(image_summary.digest)')"
if [[ ! "$image_digest" =~ ^sha256:[a-f0-9]{64}$ ]]; then
  echo "Could not resolve a valid immutable image digest; no service changes applied." >&2
  exit 1
fi
image_ref="$repository_url/game@$image_digest"

terraform -chdir=infra/service init
terraform -chdir=infra/service apply -var="project_id=$project_id" -var="region=$region" -var="image=$image_ref"
terraform -chdir=infra/service output -raw public_url
echo
