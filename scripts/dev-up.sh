#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/infra/docker/docker-compose.yml")

echo "==> Building and starting full stack…"
"${COMPOSE[@]}" up --build -d

echo "==> Waiting for Gateway health…"
for i in $(seq 1 60); do
  if curl -fsS http://localhost:8080/health >/dev/null 2>&1; then
    echo "Gateway is up."
    break
  fi
  if [[ "$i" -eq 60 ]]; then
    echo "Timed out waiting for gateway. Check: make logs" >&2
    exit 1
  fi
  sleep 2
done

cat <<'EOF'

Stack ready.

  Web         http://localhost:3000
  Gateway     http://localhost:8080/health
  Airport     http://localhost:8081/swagger
  Itinerary   http://localhost:8082/swagger

Useful:
  make smoke   # quick API checks
  make logs    # follow logs
  make down    # stop everything

EOF
