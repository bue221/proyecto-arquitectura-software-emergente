> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Local setup

## Prerequisites

- Go 1.22+
- Node.js 20+
- Docker + Docker Compose

## Option A — one command (recommended)

From the repo root:

```bash
make up      # build + start full stack
make smoke  # health + airport + JWT itinerary
make logs   # follow containers
make down   # stop
```

Or without Make:

```bash
./scripts/dev-up.sh
./scripts/dev-smoke.sh
./scripts/dev-down.sh
```

Services:

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API Gateway | http://localhost:8080/health |
| Airport API / Swagger | http://localhost:8081/swagger |
| Airport resilience | http://localhost:8081/api/v1/resilience |
| Itinerary API / Swagger | http://localhost:8082/swagger |
| Redis | localhost:6379 |
| Itinerary Postgres | localhost:5434 |

## Option B — native processes

```bash
# 1) Infra
docker run --rm --name pi-redis -p 6379:6379 redis:7-alpine
docker run --rm --name itinerary-db \
  -e POSTGRES_USER=itinerary -e POSTGRES_PASSWORD=itinerary -e POSTGRES_DB=itinerary \
  -p 5434:5432 postgres:16-alpine

# 2) Airport Service
cd services/airport-service
export REDIS_ADDR=localhost:6379
go run ./cmd/server

# 3) Itinerary Service
cd services/itinerary-service
export DATABASE_URL='postgres://itinerary:itinerary@localhost:5434/itinerary?sslmode=disable'
export AIRPORT_SERVICE_URL='http://localhost:8081'
go run ./cmd/server

# 4) Gateway
cd services/api-gateway && go run ./cmd/server

# 5) Web
cd apps/web
cp .env.local.example .env.local
npm install && npm run dev
```

## Smoke checks

1. `make smoke` (preferred)
2. `GET http://localhost:8081/api/v1/resilience` → `cache_backend: redis`, breaker `closed`
3. Map + itinerary form on http://localhost:3000 (browser talks only to Gateway `:8080`)

## Not available yet

RabbitMQ relay / notification FaaS, Jaeger, Testcontainers — remaining Level 2/3 PRs.
