# Local setup

## Prerequisites

- Go 1.22+
- Node.js 20+
- Docker + Docker Compose (optional for containerized run)

## Option A — native (fastest for Level 1)

```bash
# 1) Airport Service
cd services/airport-service
go test ./...
go run ./cmd/server

# 2) Web (other terminal)
cd apps/web
cp .env.local.example .env.local
npm install
npm run dev
```

- Web: http://localhost:3000
- Airport API: http://localhost:8081
- Swagger: http://localhost:8081/swagger

## Option B — Docker Compose

```bash
cd infra/docker
docker compose up --build
```

Browser still uses `http://localhost:8081` for the Airport API (client-side fetch).

## Smoke checks (Level 1)

1. `GET /health` → `{"status":"ok"}`
2. `GET /api/v1/airports/1` → adapted DTO with `lat`/`lon` (not raw API Colombia schema)
3. `GET /api/v1/airports` → `{ count, points[] }` for Plotly
4. Web map shows markers without calling API Colombia from the browser

## Not available yet

Gateway, Itinerary CRUD, RabbitMQ, Redis, Jaeger — later PRs (Level 1 itinerary / Level 2+).
