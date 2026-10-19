> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Component diagram

```mermaid
flowchart TB
  WEB[apps/web Next.js + shadcn :3000]
  GW[services/api-gateway :8080]
  AIR[services/airport-service :8081]
  ITI[services/itinerary-service :8082]
  NF[services/notification-function planned]
  PG2[(Postgres Itinerary :5434)]
  REDIS[(Redis :6379)]
  RMQ[[RabbitMQ planned]]
  COL[API Colombia]

  WEB -->|JWT for itineraries| GW
  GW -->|public airports| AIR
  GW -->|protected itineraries| ITI
  ITI -->|S2S validate airports| AIR
  AIR --> COL
  AIR --> REDIS
  ITI --> PG2
  ITI -.-> RMQ
  RMQ -.-> NF
```

## Current wiring

- Browser → **API Gateway only** (`:8080`).
- Itinerary routes require Bearer JWT issued via `POST /auth/token`.
- Itinerary → Airport remains direct service-to-service (not through the gateway).
- Airport → Redis cache-aside; circuit breaker wraps Colombia HTTP.
- RabbitMQ / FaaS still planned.

## Notes

- Each service package is independently buildable/deployable.
- Contracts live in `packages/contracts` and `packages/proto`.
- Local stack: `make up` from repo root.
