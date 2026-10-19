> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Transactional Outbox & Double Write

## Problem

```mermaid
sequenceDiagram
  participant S as Itinerary Service
  participant DB as Postgres
  participant Q as RabbitMQ

  Note over S,Q: Unsafe dual write
  S->>DB: INSERT itinerary COMMIT
  S->>Q: Publish event
  Note right of Q: Broker down → event lost<br/>or publish before commit → phantom
```

## Solution

```mermaid
sequenceDiagram
  participant S as Itinerary Service
  participant DB as Postgres
  participant R as Outbox Relay
  participant Q as RabbitMQ
  participant F as Notification Function

  S->>DB: BEGIN
  S->>DB: INSERT itinerary
  S->>DB: INSERT outbox unpublished
  S->>DB: COMMIT
  R->>DB: SELECT unpublished
  R->>Q: Publish ItineraryCreated
  R->>DB: Mark published
  Q->>F: Consume idempotently
```

## Guarantees

- **No event without committed itinerary** (same transaction).
- **At-least-once** to consumers → idempotent handlers.
- Relay lag is acceptable (eventual consistency) and must be metricized.
