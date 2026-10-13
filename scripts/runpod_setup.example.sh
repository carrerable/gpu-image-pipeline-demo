#!/usr/bin/env bash
# Illustrative example, written from scratch for this demo. Not the script I run, and not tested against your account.
# It shows the shape of the idea: create a pod for ONE batch, work, and ALWAYS delete the pod, under a spending cap.
# Check the current Runpod REST API reference before using it. A pod bills by the hour until it is deleted.
#
# Usage: RUNPOD_API_KEY=... ./runpod_setup.example.sh <max_usd> <max_hours> <usd_per_hour>
set -euo pipefail

: "${RUNPOD_API_KEY:?Set RUNPOD_API_KEY in your environment (never put it in this file)}"
MAX_USD="${1:?spending cap in USD is required}"
MAX_HOURS="${2:?maximum hours is required}"
RATE="${3:?hourly rate in USD is required}"

# The cap is checked BEFORE anything paid is created.
awk -v h="$MAX_HOURS" -v r="$RATE" -v c="$MAX_USD" 'BEGIN { if (h * r > c) { print "Refusing: " h " h x " r " = " h * r " USD is over the cap " c; exit 1 } }'

API="https://rest.runpod.io/v1"
auth=(-H "Authorization: Bearer ${RUNPOD_API_KEY}" -H "Content-Type: application/json")

POD_ID=""
cleanup() {
  if [ -n "$POD_ID" ]; then
    echo "Deleting pod $POD_ID"
    curl -sS -X DELETE "${auth[@]}" "$API/pods/$POD_ID" >/dev/null || echo "DELETE FAILED: delete the pod by hand in the console" >&2
  fi
}
trap cleanup EXIT INT TERM

# 1. Create the pod for this batch (image name and GPU are placeholders).
POD_ID=$(curl -sS -X POST "${auth[@]}" "$API/pods" -d '{
  "name": "batch-example",
  "cloudType": "COMMUNITY",
  "gpuTypeIds": ["NVIDIA GeForce RTX 3090"],
  "gpuCount": 1,
  "imageName": "your-comfyui-image:tag",
  "containerDiskInGb": 50,
  "ports": ["8188/http"]
}' | sed -n 's/.*"id" *: *"\([^"]*\)".*/\1/p')
echo "Pod created: ${POD_ID:?no pod id returned}"

# 2. Download models in parallel (one URL per line in models.txt, kept outside the repo).
#    xargs -P 4 -n 1 wget -q -P /workspace/models < models.txt

# 3. Start ComfyUI, run the batch, collect the outputs.
#    ... your batch here ...

# 4. The trap deletes the pod when this script ends, whatever the exit status.
