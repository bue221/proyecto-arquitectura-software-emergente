# Setup local

## Requisitos

- Go 1.22+
- Node.js 20+
- Docker + Docker Compose
- Make

## Recomendado — Makefile

Desde la raíz del repo:

```bash
make up      # build + levantar el stack de Compose
make smoke   # health checks vía Gateway
make down    # detener el stack
make wiki    # publicar wiki/ → GitHub Wiki (después del merge)
```

| Servicio | URL |
|----------|-----|
| Web | http://localhost:3001 (Compose mapea `3001→3000`; el `:3000` del host suele ser otra app Next) |
| **API Gateway** | http://localhost:8080 |
| Airport (directo) | http://localhost:8081/swagger |
| Itinerary (directo) | http://localhost:8082/swagger |
| Postgres de Itinerary | localhost:5434 |
| Redis | localhost:6379 |
| RabbitMQ AMQP | localhost:5672 |
| UI de RabbitMQ | http://localhost:15672 (guest/guest) |
| FaaS de notificación | http://localhost:8083/health |
| Postgres de notificación | localhost:5435 |
| UI de Jaeger | http://localhost:16686 |
| gRPC de Airport | localhost:9091 |

El navegador debe llamar **solo al Gateway** (`:8080`).

JWT de demo (local):

```bash
curl -s -X POST http://localhost:8080/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"sub":"demo","name":"Demo User"}'
```

Usa el Bearer devuelto en las rutas de itinerario.

## Opción B — Compose directo

```bash
cd infra/docker
docker compose up --build
```

## Opción C — procesos nativos

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

## Publicar la wiki

Después de fusionar un PR que cambió `wiki/`:

```bash
make wiki
```

Ver `AGENTS.md`: la sincronización de la wiki es obligatoria en cada PR de producto o arquitectura. La prosa de `wiki/` va en español.
