#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 scripts/<file>.mjs" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SCRIPT_PATH="$1"

if [ ! -f "$SCRIPT_PATH" ]; then
  echo "Script not found: $SCRIPT_PATH" >&2
  exit 1
fi

PROD_HOST="${PROD_HOST:-138.124.118.116}"
PROD_PATH="${PROD_PATH:-/root/goszakon}"
APP_CONTAINER="${APP_CONTAINER:-goszakon-app}"
REMOTE_SCRIPT_PATH="${PROD_PATH}/${SCRIPT_PATH}"

scp -i ~/.ssh/id_ed25519_goszakon -o StrictHostKeyChecking=no "$SCRIPT_PATH" "root@${PROD_HOST}:${REMOTE_SCRIPT_PATH}"
ssh -i ~/.ssh/id_ed25519_goszakon -o StrictHostKeyChecking=no "root@${PROD_HOST}" \
  "docker cp '${REMOTE_SCRIPT_PATH}' '${APP_CONTAINER}:/app/${SCRIPT_PATH}' && docker exec '${APP_CONTAINER}' sh -lc 'cd /app && node ${SCRIPT_PATH}'"
