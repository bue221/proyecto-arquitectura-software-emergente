# itinerary-service

Go hexagonal microservice for the **Itinerary Planning** bounded context.

## Features (Level 1)

- CRUD itineraries on dedicated Postgres
- Versioned SQL migrations on startup
- Validates origin/destination via Airport Service HTTP
- Writes `ItineraryCreated` to **outbox** in the same transaction (relay/RabbitMQ in later PRs)
- Swagger UI + structured JSON logs with `trace_id`

## Run with Compose

From repo root:

```bash
docker compose -f infra/docker/docker-compose.yml up --build airport-service itinerary-db itinerary-service
```

## Run locally

```bash
# Postgres (example)
docker run --rm -e POSTGRES_USER=itinerary -e POSTGRES_PASSWORD=itinerary -e POSTGRES_DB=itinerary   -p 5434:5432 postgres:16-alpine

export DATABASE_URL='postgres://itinerary:itinerary@localhost:5434/itinerary?sslmode=disable'
export AIRPORT_SERVICE_URL='http://localhost:8081'
go test ./...
go run ./cmd/server
```

- API: http://localhost:8082
- Swagger: http://localhost:8082/swagger

## Docs

[`../../docs/02-services/itinerary-service.md`](../../docs/02-services/itinerary-service.md)
