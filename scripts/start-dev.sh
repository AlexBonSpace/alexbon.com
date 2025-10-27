#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

PORT="${PORT:-4321}"
HOST="${HOST:-0.0.0.0}"
URL="http://localhost:${PORT}"

info() {
  printf '👉 %s\n' "$*"
}

success() {
  printf '✅ %s\n' "$*"
}

warn() {
  printf '⚠️  %s\n' "$*" >&2
}

if [ ! -d node_modules ]; then
  info "Installing dependencies (npm install)…"
  npm install
else
  success "Dependencies already installed."
fi

if [ -d node_modules/.vite ]; then
  info "Clearing Vite prebundle cache (node_modules/.vite)…"
  rm -rf node_modules/.vite
  success "Vite cache reset."
fi

get_port_pids() {
  if command -v ss >/dev/null 2>&1; then
    ss -ltnp 2>/dev/null | awk -v PORT="$PORT" '
      NR > 1 {
        split($4, parts, ":")
        if (parts[length(parts)] == PORT) {
          for (i = 1; i <= NF; i++) {
            if ($i ~ /pid=/) {
              split($i, tmp, "=")
              gsub(/[^0-9].*/, "", tmp[2])
              if (tmp[2] != "") print tmp[2]
            }
          }
        }
      }
    ' | sort -u
  elif command -v lsof >/dev/null 2>&1; then
    lsof -ti tcp:"$PORT" 2>/dev/null | sort -u
  elif command -v fuser >/dev/null 2>&1; then
    fuser "${PORT}"/tcp 2>/dev/null | tr -s ' ' '\n' | sort -u
  else
    return 0
  fi
}

if EXISTING_PIDS="$(get_port_pids)"; then
  if [ -n "$EXISTING_PIDS" ]; then
    warn "Port ${PORT} is busy (PIDs: ${EXISTING_PIDS}). Attempting to stop…"
    for PID in $EXISTING_PIDS; do
      kill "$PID" 2>/dev/null || true
    done
    sleep 1
    REMAINING_PIDS="$(get_port_pids || true)"
    if [ -n "$REMAINING_PIDS" ]; then
      warn "Force killing remaining processes on ${PORT}."
      for PID in $REMAINING_PIDS; do
        kill -9 "$PID" 2>/dev/null || true
      done
      sleep 1
    fi
    FINAL_PIDS="$(get_port_pids || true)"
    if [ -n "$FINAL_PIDS" ]; then
      echo "❌ Unable to free port ${PORT}. Still held by: ${FINAL_PIDS}" >&2
      exit 1
    fi
  fi
fi

info "Starting Astro dev server on ${HOST}:${PORT}…"
npm run dev -- --hostname "$HOST" --port "$PORT" --force &
SERVER_PID=$!

cleanup() {
  echo
  info "Stopping dev server…"
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT

info "Waiting for ${URL} to respond…"
until curl -sSf "$URL" >/dev/null 2>&1; do
  sleep 1
  if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    echo "❌ Dev server exited unexpectedly. Check logs above." >&2
    exit 1
  fi
done
success "Server is live at ${URL}."

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 &
elif command -v open >/dev/null 2>&1; then
  open "$URL" >/dev/null 2>&1 &
elif command -v start >/dev/null 2>&1; then
  start "" "$URL" >/dev/null 2>&1 &
else
  warn "Could not auto-open browser; visit ${URL} manually."
fi

success "Press Ctrl+C to stop the dev server."
wait "$SERVER_PID"
