#!/usr/bin/env sh
#
# Entry point for the ws-scrcpy Home Assistant add-on.
#
# - reads the user's add-on options from /data/options.json (Supervisor) when
#   present, otherwise falls back to sensible defaults so the image still works
#   under a plain `docker run`;
# - starts a local adb server and (optionally) connects to wireless-debugging
#   devices listed in the options;
# - generates the ws-scrcpy run configuration and launches the server.
set -e

OPTIONS_FILE="/data/options.json"

read_opt() {
    # read_opt <jq-filter> <default>
    if [ -f "$OPTIONS_FILE" ]; then
        value="$(jq -r "$1 // empty" "$OPTIONS_FILE" 2>/dev/null || true)"
        [ -n "$value" ] && { echo "$value"; return; }
    fi
    echo "$2"
}

PORT="$(read_opt '.port' '8000')"
DEBUG="$(read_opt '.debug' 'false')"

if [ "$DEBUG" = "true" ]; then
    export WS_SCRCPY_DEBUG=1
fi

# Persist the adb client RSA key on the add-on's /data volume (which survives
# restarts, updates and host reboots). Without this, the key lives in the
# ephemeral container filesystem and is regenerated on every add-on update, so
# devices re-prompt to authorize "this computer" each time. Pointing HOME at
# /data makes adb keep its key in /data/.android/adbkey permanently, so you only
# authorize once ("Always allow from this computer").
export HOME=/data
mkdir -p /data/.android
if [ ! -f /data/.android/adbkey ]; then
    echo "[ws-scrcpy] generating persistent adb key in /data/.android"
    adb keygen /data/.android/adbkey || echo "[ws-scrcpy] warning: 'adb keygen' failed (a key will be auto-generated)"
fi

echo "[ws-scrcpy] starting adb server..."
adb start-server || echo "[ws-scrcpy] warning: 'adb start-server' failed (continuing)"

# Auto-connect to any wireless-debugging devices the user configured.
if [ -f "$OPTIONS_FILE" ]; then
    jq -r '.adb_devices[]? // empty' "$OPTIONS_FILE" 2>/dev/null | while IFS= read -r device; do
        [ -z "$device" ] && continue
        echo "[ws-scrcpy] adb connect $device"
        adb connect "$device" || echo "[ws-scrcpy] warning: could not connect to $device"
    done
fi

# Generate the ws-scrcpy configuration (Android-only, single HTTP server).
cat > /app/config.yaml <<EOF
runGoogTracker: true
runApplTracker: false
server:
  - secure: false
    port: ${PORT}
EOF

export WS_SCRCPY_CONFIG=/app/config.yaml

echo "[ws-scrcpy] listening on port ${PORT}"
cd /app
exec node index.js
