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

curl -fsS -X POST http://localhost:8080/api/v1/itineraries \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"userName":"Smoke","originAirportId":"1","destinationAirportId":"2","travelDate":"2026-12-01","durationMinutes":80}' \
  | python3 -c 'import sys,json; d=json.load(sys.stdin); print("created", d["id"])'

echo
echo "Smoke OK."
