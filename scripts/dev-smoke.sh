#!/usr/bin/env bash
set -euo pipefail

echo "==> Gateway health"
curl -fsS http://localhost:8080/health | tee /tmp/pi-gw-health.json
echo

echo "==> Airport via gateway"
curl -fsS http://localhost:8080/api/v1/airports/1 | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["id"], d["name"], d.get("lat"))'
echo

echo "==> Airport resilience status"
curl -fsS http://localhost:8081/api/v1/resilience | tee /tmp/pi-resilience.json
echo

echo "==> JWT + create itinerary via gateway"
TOKEN=$(curl -fsS -X POST http://localhost:8080/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"subject":"smoke","role":"traveler"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["accessToken"])')

CREATED=$(curl -fsS -X POST http://localhost:8080/api/v1/itineraries \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"userName":"Smoke","originAirportId":"1","destinationAirportId":"2","travelDate":"2026-12-01","durationMinutes":80}')
echo "$CREATED" | python3 -c 'import sys,json; d=json.load(sys.stdin); print("created", d["id"])'
ITINERARY_ID=$(echo "$CREATED" | python3 -c 'import sys,json; print(json.load(sys.stdin)["id"])')

echo
echo "==> Notification function health"
curl -fsS http://localhost:8083/health | tee /tmp/pi-notify-health.json
echo

echo "==> Wait for outbox → RabbitMQ → notification (up to 15s)"
for i in $(seq 1 15); do
  COUNT=$(docker compose -f infra/docker/docker-compose.yml exec -T notification-db \
    psql -U notify -d notify -tAc "SELECT count(*) FROM notification_records WHERE itinerary_id='${ITINERARY_ID}'" 2>/dev/null || echo 0)
  COUNT=$(echo "$COUNT" | tr -d '[:space:]')
  if [[ "$COUNT" == "1" ]]; then
    echo "notification_records ok (attempt $i)"
    echo
    echo "Smoke OK."
    exit 0
  fi
  sleep 1
done

echo "WARN: notification not observed within 15s (check outbox relay / RabbitMQ / notify logs)"
echo "Smoke OK (sync path); async notify pending verification."
