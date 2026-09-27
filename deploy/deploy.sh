#!/usr/bin/env bash
# One-command deploy to Cloud Run (builds the container with Cloud Build, no local Docker needed).
# Usage: bash deploy/deploy.sh [PROJECT_ID] [REGION]
set -euo pipefail
project="${1:-twk-experiments}"
region="${2:-us-west1}"
cd "$(dirname "$0")/.."
npm test
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project "$project"
gcloud run deploy plumber-wars \
  --project "$project" --region "$region" --source . \
  --allow-unauthenticated --port 8080 \
  --cpu 1 --memory 256Mi --min-instances 0 --max-instances 3 --concurrency 80
url="$(gcloud run services describe plumber-wars --project "$project" --region "$region" --format='value(status.url)')"
echo "Live at: $url"
npx --yes qrcode -o deploy/plumber-wars-qr.png -w 600 "$url"
npx --yes qrcode "$url" </dev/null
echo "QR code saved to deploy/plumber-wars-qr.png"
