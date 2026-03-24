#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[verify-release] Running Prisma generate"
npm run prisma:generate

echo "[verify-release] Running production build"
npm run build

echo "[verify-release] Release checks passed"
