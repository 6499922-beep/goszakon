#!/usr/bin/env bash
set -euo pipefail

cd /root/goszakon

LOG_FILE="/var/log/goszakon-monitor.log"
BASE_URL="${BASE_URL:-https://goszakon.ru}"
DISK_WARN_THRESHOLD="${DISK_WARN_THRESHOLD:-85}"
DISK_PRUNE_THRESHOLD="${DISK_PRUNE_THRESHOLD:-92}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
PROJECT_NAME="${PROJECT_NAME:-}"
APP_CONTAINER="${APP_CONTAINER:-goszakon-app}"
DB_CONTAINER="${DB_CONTAINER:-goszakon-db}"

timestamp() {
  date '+%Y-%m-%d %H:%M:%S'
}

log() {
  printf '[%s] %s\n' "$(timestamp)" "$1" >> "$LOG_FILE"
}

disk_usage="$(df -P / | awk 'NR==2 {gsub("%", "", $5); print $5}')"
app_status="$(docker inspect --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$APP_CONTAINER" 2>/dev/null || echo 'missing missing')"
db_status="$(docker inspect --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$DB_CONTAINER" 2>/dev/null || echo 'missing missing')"

if [[ "$disk_usage" -ge "$DISK_WARN_THRESHOLD" ]]; then
  log "disk usage warning: ${disk_usage}% used on /"
fi

if [[ "$disk_usage" -ge "$DISK_PRUNE_THRESHOLD" ]]; then
  log "disk usage critical: ${disk_usage}% used on /, pruning docker cache"
  docker image prune -f >/dev/null 2>&1 || true
  docker builder prune -af >/dev/null 2>&1 || true
  docker system prune -f >/dev/null 2>&1 || true
fi

if [[ "$db_status" != "running no-healthcheck" ]]; then
  log "database status abnormal: ${db_status}"
fi

if [[ "$app_status" != "running healthy" ]]; then
  log "app status abnormal: ${app_status}, restarting app container"
  if [ -n "$PROJECT_NAME" ]; then
    docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up -d --force-recreate app >> "$LOG_FILE" 2>&1 || true
  else
    docker compose -f "$COMPOSE_FILE" up -d --force-recreate app >> "$LOG_FILE" 2>&1 || true
  fi
  sleep 10
fi

main_code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE_URL}/" || echo '000')"
case_code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE_URL}/cases" || echo '000')"

if [[ "$main_code" != "200" || "$case_code" != "200" ]]; then
  log "health endpoint failed: /=${main_code}, /cases=${case_code}; restarting app container"
  if [ -n "$PROJECT_NAME" ]; then
    docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up -d --force-recreate app >> "$LOG_FILE" 2>&1 || true
  else
    docker compose -f "$COMPOSE_FILE" up -d --force-recreate app >> "$LOG_FILE" 2>&1 || true
  fi
  sleep 10
  main_code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE_URL}/" || echo '000')"
  case_code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE_URL}/cases" || echo '000')"
  log "post-restart health: /=${main_code}, /cases=${case_code}"
fi

log "ok: disk=${disk_usage}% app='${app_status}' db='${db_status}' /=${main_code} /cases=${case_code}"
