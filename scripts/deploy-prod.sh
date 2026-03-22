#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

git push origin main
scp -i ~/.ssh/id_ed25519_goszakon -o StrictHostKeyChecking=no ./scripts/server-deploy.sh root@185.185.142.238:/root/goszakon/deploy.sh
ssh -i ~/.ssh/id_ed25519_goszakon -o StrictHostKeyChecking=no root@185.185.142.238 "chmod +x /root/goszakon/deploy.sh && /root/goszakon/deploy.sh"
