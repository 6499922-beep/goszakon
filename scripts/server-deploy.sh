#!/usr/bin/env bash
set -euo pipefail

cd /root/goszakon

git pull origin main
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose -f docker-compose.tender.yml up -d --build --remove-orphans
docker exec goszakon-tender-app npx prisma db push --skip-generate
docker image prune -f >/dev/null 2>&1 || true
docker builder prune -af >/dev/null 2>&1 || true
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
