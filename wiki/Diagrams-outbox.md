> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Transactional Outbox y double write

## Problema

```mermaid
sequenceDiagram
  participant S as Itinerary Service
  participant DB as Postgres
  participant Q as RabbitMQ

  Note over S,Q: Doble escritura insegura
  S->>DB: INSERT itinerary COMMIT
  S->>Q: Publicar evento
  Note right of Q: Bróker caído → evento perdido<br/>o publicar antes del commit → fantasma
```

## Solución

```mermaid
sequenceDiagram
  participant S as Itinerary Service
  participant DB as Postgres
  participant R as Outbox Relay
  participant Q as RabbitMQ
  participant F as Función de notificación

  S->>DB: BEGIN
  S->>DB: INSERT itinerary
  S->>DB: INSERT outbox sin publicar
  S->>DB: COMMIT
  R->>DB: SELECT no publicados
  R->>Q: Publicar ItineraryCreated
  R->>DB: Marcar publicado
  Q->>F: Consumir de forma idempotente
```

## Garantías

- **No hay evento sin itinerario confirmado** (la misma transacción).
- **At-least-once** hacia los consumidores → handlers idempotentes.
- El retraso del relay es aceptable (consistencia eventual) y debe medirse.
