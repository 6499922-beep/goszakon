#!/usr/bin/env bash
set -euo pipefail

cd /root/goszakon

git pull origin main
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose up -d --build --remove-orphans
docker image prune -f >/dev/null 2>&1 || true
docker builder prune -af >/dev/null 2>&1 || true
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
