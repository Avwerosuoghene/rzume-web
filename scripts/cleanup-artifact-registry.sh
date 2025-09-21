#!/bin/bash
# Cleanup script for Artifact Registry (rzume-api-images)
# Keeps only the latest 10 images and deletes the rest

PROJECT_ID="rzume-client"
LOCATION="us-central1"
REPO="rzume-web"

# Repo path (for reference only)
BASE_PATH="${LOCATION}-docker.pkg.dev/${PROJECT_ID}/${REPO}"

echo "Fetching Docker images from $BASE_PATH ..."

# List images with PACKAGE and DIGEST (PACKAGE is already the full path)
IMAGES=$(gcloud artifacts docker images list $BASE_PATH \
  --format="value(PACKAGE,DIGEST)" \
  --sort-by=~UPDATE_TIME)

COUNT=0
KEEP=10

while read -r PACKAGE DIGEST; do
  COUNT=$((COUNT+1))
  IMAGE_PATH="${PACKAGE}@${DIGEST}"   

  if [ $COUNT -le $KEEP ]; then
    echo "Keeping: $IMAGE_PATH"
  else
    echo "Deleting: $IMAGE_PATH"
    gcloud artifacts docker images delete "$IMAGE_PATH" --quiet --delete-tags
  fi
done <<< "$IMAGES"

echo "Cleanup complete. Kept the latest $KEEP images."