# Local setup

## Prerequisites

- Go 1.22+
- Node.js 20+
- Docker + Docker Compose

## Option A — Docker Compose (recommended)

```bash
cd infra/docker
docker compose up --build
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| **API Gateway** | http://localhost:8080 |
| Airport (direct) | http://localhost:8081/swagger |
| Itinerary (direct) | http://localhost:8082/swagger |
| Itinerary Postgres | localhost:5434 |

The browser should call **only the Gateway** (`:8080`).

## Option B — native processes

```bash
# Postgres
docker run --rm --name itinerary-db \
  -e POSTGRES_USER=itinerary -e POSTGRES_PASSWORD=itinerary -e POSTGRES_DB=itinerary \
  -p 5434:5432 postgres:16-alpine

# Airport
cd services/airport-service && go run ./cmd/server

# Itinerary
cd services/itinerary-service
export DATABASE_URL='postgres://itinerary:itinerary@localhost:5434/itinerary?sslmode=disable'
export AIRPORT_SERVICE_URL='http://localhost:8081'
go run ./cmd/server

# Gateway
cd services/api-gateway
export AIRPORT_SERVICE_URL=http://localhost:8081
export ITINERARY_SERVICE_URL=http://localhost:8082
export JWT_SIGNING_KEY=dev-only-change-me
go run ./cmd/server

# Web
cd apps/web
cp .env.local.example .env.local
npm install && npm run dev
```

## Smoke checks

```bash
curl -sS http://localhost:8080/health

# Public airports via gateway
curl -sS http://localhost:8080/api/v1/airports/1

# Token + protected itinerary create
TOKEN=$(curl -sS -X POST http://localhost:8080/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"subject":"ana","role":"traveler"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["accessToken"])')

curl -sS -X POST http://localhost:8080/api/v1/itineraries \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"userName":"Ana","originAirportId":"1","destinationAirportId":"2","travelDate":"2026-11-01","durationMinutes":95}'
```

Without `Authorization`, itinerary routes must return **401**.
