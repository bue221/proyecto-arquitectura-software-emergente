> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Component diagram

```mermaid
flowchart TB
  WEB[apps/web Next.js + shadcn + Plotly :3000]

  GW[services/api-gateway planned L2]
  AIR[services/airport-service :8081]
  ITI[services/itinerary-service :8082]
  NF[services/notification-function planned L2]

  PG2[(Postgres Itinerary :5434)]
  REDIS[(Redis planned L2)]
  RMQ[[RabbitMQ planned L2]]
  COL[API Colombia]

  WEB --> AIR
  WEB --> ITI
  WEB -.-> GW
  GW -.-> AIR
  GW -.-> ITI
  ITI --> AIR
  AIR --> COL
  AIR -.-> REDIS
  ITI --> PG2
  ITI -.-> RMQ
  RMQ -.-> NF
```

## Current Level 1 wiring

- Web calls Airport and Itinerary **directly** (Gateway arrives in Level 2).
- Airport uses in-memory cache today; Redis is Level 2.
- Itinerary writes outbox rows; broker relay is Level 2/3.

## Notes

- Each service package is independently buildable/deployable.
- Contracts live in `packages/contracts` and `packages/proto` (not shown as runtime boxes).
