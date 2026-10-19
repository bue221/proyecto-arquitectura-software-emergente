> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

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

Services:

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| Airport API / Swagger | http://localhost:8081/swagger |
| Itinerary API / Swagger | http://localhost:8082/swagger |
| Itinerary Postgres | localhost:5434 |

## Option B — native processes

```bash
# 1) Postgres for itineraries
docker run --rm --name itinerary-db \
  -e POSTGRES_USER=itinerary -e POSTGRES_PASSWORD=itinerary -e POSTGRES_DB=itinerary \
  -p 5434:5432 postgres:16-alpine

# 2) Airport Service
cd services/airport-service && go run ./cmd/server

# 3) Itinerary Service
cd services/itinerary-service
export DATABASE_URL='postgres://itinerary:itinerary@localhost:5434/itinerary?sslmode=disable'
export AIRPORT_SERVICE_URL='http://localhost:8081'
go test ./...
go run ./cmd/server

# 4) Web
cd apps/web
cp .env.local.example .env.local
npm install && npm run dev
```

## Smoke checks (Level 1)

1. `GET http://localhost:8081/health` and `/api/v1/airports/1`
2. `GET http://localhost:8082/health`
3. Create itinerary:
   ```bash
   curl -sS -X POST http://localhost:8082/api/v1/itineraries \
     -H 'Content-Type: application/json' \
     -d '{"userName":"Ana","originAirportId":"1","destinationAirportId":"2","travelDate":"2026-11-01","durationMinutes":95}'
   ```
4. Confirm map + itinerary form on http://localhost:3000
5. Confirm browser never calls `api-colombia.com`

## Not available yet

API Gateway, Redis CB, RabbitMQ relay/notifications, Jaeger — Level 2+ PRs.
