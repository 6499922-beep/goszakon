#!/usr/bin/env bash
set -euo pipefail

APP_PATH="${APP_PATH:-/root/goszakon}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
APP_SERVICE="${APP_SERVICE:-app}"
APP_CONTAINER="${APP_CONTAINER:-goszakon-app}"

cd "$APP_PATH"

git pull origin main
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans
docker exec "$APP_CONTAINER" npx prisma db push
docker image prune -f >/dev/null 2>&1 || true
docker builder prune -af >/dev/null 2>&1 || true

if docker inspect --format '{{json .State.Health.Status}}' "$APP_CONTAINER" >/dev/null 2>&1; then
  until [ "$(docker inspect --format '{{.State.Health.Status}}' "$APP_CONTAINER")" = "healthy" ]; do
    sleep 2
  done
fi

docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
