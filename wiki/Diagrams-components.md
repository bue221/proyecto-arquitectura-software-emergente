# Component diagram

```mermaid
flowchart TB
  WEB[apps/web Next.js :3001]
  GW[services/api-gateway :8080]
  AIR[services/airport-service :8081]
  ITI[services/itinerary-service :8082]
  NF[services/notification-function :8083]
  PG2[(Postgres Itinerary :5434)]
  PG3[(Postgres Notify :5435)]
  REDIS[(Redis :6379)]
  RMQ[[RabbitMQ :5672]]
  COL[API Colombia]

  WEB -->|JWT for itineraries| GW
  GW -->|public airports| AIR
  GW -->|protected itineraries| ITI
  ITI -->|S2S validate airports| AIR
  AIR --> COL
  AIR --> REDIS
  ITI --> PG2
  ITI -->|outbox relay| RMQ
  RMQ --> NF
  NF --> PG3
```

## Current wiring

- Browser → **API Gateway only** (`:8080`).
- Itinerary routes require Bearer JWT issued via `POST /auth/token`.
- Itinerary → Airport remains direct service-to-service (not through the gateway).
- Airport → Redis cache-aside; circuit breaker wraps Colombia HTTP.
- Itinerary outbox relay → RabbitMQ → notification-function (idempotent).

## Notes

- Each service package is independently buildable/deployable.
- Contracts live in `packages/contracts` and `packages/proto`.
- Local stack: `make up` from repo root.
