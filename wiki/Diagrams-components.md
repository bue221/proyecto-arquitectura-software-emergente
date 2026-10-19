# Diagrama de componentes

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

  WEB -->|JWT para itinerarios| GW
  GW -->|aeropuertos públicos| AIR
  GW -->|itinerarios protegidos| ITI
  ITI -->|S2S validar aeropuertos| AIR
  AIR --> COL
  AIR --> REDIS
  ITI --> PG2
  ITI -->|relay de outbox| RMQ
  RMQ --> NF
  NF --> PG3
```

## Cableado actual

- El navegador va **solo al API Gateway** (`:8080`).
- Las rutas de itinerario exigen un JWT Bearer emitido por `POST /auth/token`.
- Itinerary → Airport sigue siendo servicio a servicio directo (no pasa por el gateway).
- Airport → caché Redis cache-aside; el circuit breaker envuelve el HTTP de Colombia.
- Relay de outbox de Itinerary → RabbitMQ → notification-function (idempotente).

## Notas

- Cada paquete de servicio se construye y despliega por separado.
- Los contratos viven en `packages/contracts` y `packages/proto`.
- Stack local: `make up` desde la raíz del repo.
