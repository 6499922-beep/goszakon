#!/usr/bin/env bash
set -euo pipefail

APP_PATH="${APP_PATH:-/root/goszakon}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
APP_SERVICE="${APP_SERVICE:-app}"
APP_CONTAINER="${APP_CONTAINER:-goszakon-app}"
PROJECT_NAME="${PROJECT_NAME:-goszakon-public}"
REMOVE_ORPHANS="${REMOVE_ORPHANS:-false}"
RUN_DB_PUSH="${RUN_DB_PUSH:-true}"

cd "$APP_PATH"

git fetch origin main
git reset --hard origin/main
git clean -fd

compose_cmd=(docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE")
up_args=(-d --build)

if [ "$REMOVE_ORPHANS" = "true" ]; then
  up_args+=(--remove-orphans)
fi

DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 "${compose_cmd[@]}" up "${up_args[@]}"

if [ "$RUN_DB_PUSH" = "true" ]; then
  docker exec "$APP_CONTAINER" npx prisma db push
fi

docker image prune -f >/dev/null 2>&1 || true
docker builder prune -af >/dev/null 2>&1 || true

if docker inspect --format '{{json .State.Health.Status}}' "$APP_CONTAINER" >/dev/null 2>&1; then
  until [ "$(docker inspect --format '{{.State.Health.Status}}' "$APP_CONTAINER")" = "healthy" ]; do
    sleep 2
  done
fi

docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
