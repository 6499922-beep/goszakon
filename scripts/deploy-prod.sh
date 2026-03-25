#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

"$ROOT_DIR/scripts/verify-release.sh"

git push origin main
PROD_HOST="${PROD_HOST:-138.124.118.116}"

scp -i ~/.ssh/id_ed25519_goszakon -o StrictHostKeyChecking=no ./scripts/server-deploy.sh "root@${PROD_HOST}:/root/goszakon/deploy.sh"
ssh -i ~/.ssh/id_ed25519_goszakon -o StrictHostKeyChecking=no "root@${PROD_HOST}" "chmod +x /root/goszakon/deploy.sh && /root/goszakon/deploy.sh"
