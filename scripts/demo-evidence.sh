#!/usr/bin/env bash
# Automated slice of docs/05-runbooks/demo-script.md (HTTP/CLI evidence).
# UI screenshots (map, Jaeger, Prometheus, wiki) remain manual — see the checklist in the runbook.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${DEMO_EVIDENCE_DIR:-$ROOT/docs/05-runbooks/evidence}"
GATEWAY="${GATEWAY_URL:-http://localhost:8080}"
AIRPORT="${AIRPORT_URL:-http://localhost:8081}"
ITINERARY="${ITINERARY_URL:-http://localhost:8082}"
NOTIFY="${NOTIFY_URL:-http://localhost:8083}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_DIR="$OUT/$STAMP"

mkdir -p "$RUN_DIR"
log() { printf '[demo-evidence] %s\n' "$*"; }

need() {
  if ! curl -sf --max-time 5 "$1" >/dev/null; then
    log "FAIL: $1 not reachable. Run: make up && make smoke"
    exit 1
  fi
}

log "Writing evidence under $RUN_DIR"

need "$GATEWAY/health"
need "$AIRPORT/health"
need "$ITINERARY/health"
need "$NOTIFY/health"

{
  echo "# Demo evidence run $STAMP"
  echo
  echo "## Health"
} >"$RUN_DIR/README.md"

for u in "$GATEWAY/health" "$AIRPORT/health" "$ITINERARY/health" "$NOTIFY/health"; do
  echo "### $u" >>"$RUN_DIR/README.md"
  curl -sS "$u" | tee -a "$RUN_DIR/README.md" >/dev/null
  echo >>"$RUN_DIR/README.md"
done

log "JWT token"
TOKEN_JSON="$(curl -sS -X POST "$GATEWAY/auth/token" \
  -H 'Content-Type: application/json' \
  -d '{"subject":"demo-evidence","role":"traveler"}')"
echo "$TOKEN_JSON" | tee "$RUN_DIR/01-token.json" >/dev/null
TOKEN="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["accessToken"])' <<<"$TOKEN_JSON")"

if [[ -z "${TOKEN:-}" ]]; then
  log "FAIL: could not parse accessToken from gateway response"
  cat "$RUN_DIR/01-token.json"
  exit 1
fi

log "Reject without JWT (expect 401)"
curl -sS -o "$RUN_DIR/02-itineraries-unauthorized.json" -w "%{http_code}" \
  "$GATEWAY/api/v1/itineraries" | tee "$RUN_DIR/02-itineraries-unauthorized.status" >/dev/null

log "Airport sample via gateway"
curl -sS -H "Authorization: Bearer $TOKEN" \
  "$GATEWAY/api/v1/airports/1" | tee "$RUN_DIR/03-airport-1.json" >/dev/null

log "Create itinerary"
CREATE="$(curl -sS -X POST "$GATEWAY/api/v1/itineraries" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"userName":"Demo Evidence","originAirportId":"1","destinationAirportId":"2","travelDate":"2026-12-01","durationMinutes":90}')"
echo "$CREATE" | tee "$RUN_DIR/04-create-itinerary.json" >/dev/null
ITINERARY_ID="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("id",""))' <<<"$CREATE")"

log "Controlled failure demo"
curl -sS -o "$RUN_DIR/05-demo-fail.json" -w "%{http_code}" \
  "$GATEWAY/api/v1/demo/fail" | tee "$RUN_DIR/05-demo-fail.status" >/dev/null || true

log "Airport resilience snapshot"
curl -sS "$AIRPORT/api/v1/resilience" | tee "$RUN_DIR/06-resilience.json" >/dev/null || true

log "Wait for outbox → notify (up to 15s)"
NOTIFIED=0
if [[ -n "$ITINERARY_ID" ]]; then
  for i in $(seq 1 15); do
    COUNT="$(docker compose -f "$ROOT/infra/docker/docker-compose.yml" exec -T notification-db \
      psql -U notify -d notify -tAc "SELECT count(*) FROM notification_records WHERE itinerary_id='${ITINERARY_ID}'" 2>/dev/null || echo 0)"
    COUNT="$(echo "$COUNT" | tr -d '[:space:]')"
    if [[ "$COUNT" == "1" ]]; then
      NOTIFIED=1
      echo "notification_records=1 attempt=$i" | tee "$RUN_DIR/07-notify-async.txt" >/dev/null
      break
    fi
    sleep 1
  done
fi
if [[ "$NOTIFIED" != "1" ]]; then
  echo "WARN: notification not observed within 15s" | tee "$RUN_DIR/07-notify-async.txt" >/dev/null
fi
curl -sS "$NOTIFY/health" | tee "$RUN_DIR/07-notify-health.json" >/dev/null

{
  echo
  echo "## Automated captures"
  echo "- \`01-token.json\` — Gateway JWT (\`accessToken\`)"
  echo "- \`02-itineraries-unauthorized.*\` — list without Bearer"
  echo "- \`03-airport-1.json\` — airport via Gateway"
  echo "- \`04-create-itinerary.json\` — create itinerary (id=$ITINERARY_ID)"
  echo "- \`05-demo-fail.*\` — controlled failure"
  echo "- \`06-resilience.json\` — CB / bulkhead snapshot"
  echo "- \`07-notify-async.txt\` — async notification check"
  echo
  echo "## Manual screenshots still required"
  echo "- Studio map Leaflet (\`http://localhost:3001\`)"
  echo "- Swagger UI, Jaeger \`:16686\`, Prometheus \`:9090\`, RabbitMQ \`:15672\`"
  echo "- GitHub Actions green (ci + sonar + cd-example)"
  echo "- Outbox row in Postgres / Pact / K8s manifests walkthrough"
} >>"$RUN_DIR/README.md"

log "Done. Open $RUN_DIR/README.md"
echo "$RUN_DIR"
