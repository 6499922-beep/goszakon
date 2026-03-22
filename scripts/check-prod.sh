#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://goszakon.ru}"

pages=(
  "/sudebnaya-zashita-v-zakupkah"
  "/sudebnaya-zashita-v-zakupkah/snizhenie-neustojki-postavshiku"
  "/neoplata-po-goskontraktu"
  "/spornye-praktiki/vnutrennie-sistemy-oplaty"
  "/spornye-praktiki/neravnoznachnaya-neustoyka"
)

for page in "${pages[@]}"; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}${page}")"
  printf '%s %s\n' "$code" "${BASE_URL}${page}"
done
