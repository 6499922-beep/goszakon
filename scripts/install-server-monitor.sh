#!/usr/bin/env bash
set -euo pipefail

SCRIPT_PATH="/root/goszakon/scripts/server-monitor.sh"
CRON_FILE="/etc/cron.d/goszakon-monitor"

chmod +x "$SCRIPT_PATH"
touch /var/log/goszakon-monitor.log

cat > "$CRON_FILE" <<'EOF'
*/5 * * * * root /root/goszakon/scripts/server-monitor.sh
EOF

chmod 644 "$CRON_FILE"

echo "Installed cron entry:"
cat "$CRON_FILE"
echo
echo "Current swap:"
swapon --show || true
echo
echo "Monitor log:"
tail -n 5 /var/log/goszakon-monitor.log 2>/dev/null || true
