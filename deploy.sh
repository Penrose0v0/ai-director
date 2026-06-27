#!/usr/bin/env bash
# Deploy AI Director to Cloud Run (no local Docker needed — builds on Cloud Build).
#
# Usage:
#   export GEMINI_API_KEY=your-key
#   PROJECT_ID=my-project ./deploy.sh
#
set -euo pipefail

# --- config (override via env) ---
PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID, e.g. PROJECT_ID=my-gcp-project ./deploy.sh}"
REGION="${REGION:-asia-northeast1}"      # Tokyo
SERVICE="${SERVICE:-ai-director}"
GEMINI_MODEL="${GEMINI_MODEL:-gemini-2.5-flash}"
: "${GEMINI_API_KEY:?Set GEMINI_API_KEY in your shell, e.g. export GEMINI_API_KEY=xxx}"

echo "▸ project=$PROJECT_ID region=$REGION service=$SERVICE"

gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY},GEMINI_MODEL=${GEMINI_MODEL}"

echo "✓ deployed. URL above ☝"
