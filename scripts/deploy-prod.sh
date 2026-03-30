#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

"$ROOT_DIR/scripts/verify-release.sh"

git push origin main
PROD_HOST="${PROD_HOST:-138.124.118.116}"
PROD_PATH="${PROD_PATH:-/root/goszakon}"
PROD_DEPLOY_SCRIPT="${PROD_DEPLOY_SCRIPT:-$PROD_PATH/deploy.sh}"

scp -i ~/.ssh/id_ed25519_goszakon -o StrictHostKeyChecking=no ./scripts/server-deploy.sh "root@${PROD_HOST}:${PROD_DEPLOY_SCRIPT}"
ssh -i ~/.ssh/id_ed25519_goszakon -o StrictHostKeyChecking=no "root@${PROD_HOST}" "chmod +x ${PROD_DEPLOY_SCRIPT} && APP_PATH=${PROD_PATH} COMPOSE_FILE=docker-compose.tender.yml APP_SERVICE=app APP_CONTAINER=goszakon-tender-app ${PROD_DEPLOY_SCRIPT}"
