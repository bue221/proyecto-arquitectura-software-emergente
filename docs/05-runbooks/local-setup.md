# Local setup

## Prerequisites

- Go 1.22+
- Node.js 20+
- Docker + Docker Compose
- Make

## Recommended — Makefile

From the repo root:

```bash
make up      # build + start Compose stack
make smoke   # health checks via Gateway
make down    # stop stack
make wiki    # publish wiki/ → GitHub Wiki (after merge)
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3001 (Compose maps `3001→3000`; host `:3000` is often another Next app) |
| **API Gateway** | http://localhost:8080 |
| Airport (direct) | http://localhost:8081/swagger |
| Itinerary (direct) | http://localhost:8082/swagger |
| Itinerary Postgres | localhost:5434 |
| Redis | localhost:6379 |
| RabbitMQ AMQP | localhost:5672 |
| RabbitMQ UI | http://localhost:15672 (guest/guest) |
| Notification FaaS | http://localhost:8083/health |
| Notification Postgres | localhost:5435 |

The browser should call **only the Gateway** (`:8080`).

Demo JWT (local):

```bash
curl -s -X POST http://localhost:8080/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"sub":"demo","name":"Demo User"}'
```

Use the returned Bearer token for itinerary routes.

## Option B — Compose directly

```bash
cd infra/docker
docker compose up --build
```

## Option C — native processes

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
cd services/api-gateway && go run ./cmd/server

# Web
cd apps/web && npm run dev
```

## Wiki publish

After merging a PR that changed `wiki/`:

```bash
make wiki
```

See `AGENTS.md` — mandatory wiki sync on every product/architecture PR.
