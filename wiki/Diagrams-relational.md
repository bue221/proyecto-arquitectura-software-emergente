> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Relational model (per service)

Databases are **not shared**. Diagrams below are logical schemas per service.

## Itinerary Service DB

```mermaid
erDiagram
  ITINERARIES {
    uuid id PK
    varchar user_name
    varchar origin_airport_id
    varchar destination_airport_id
    date travel_date
    int duration_minutes
    timestamptz created_at
    timestamptz updated_at
  }

  OUTBOX {
    uuid id PK
    varchar aggregate_type
    uuid aggregate_id
    varchar event_type
    jsonb payload
    timestamptz occurred_at
    timestamptz published_at
    int attempts
  }

  ITINERARIES ||--o{ OUTBOX : "creates events for"
```

## Airport Service DB (optional persistence / mirror)

```mermaid
erDiagram
  AIRPORTS {
    varchar id PK
    varchar code
    varchar name
    float lat
    float lon
    jsonb raw_adapted
    timestamptz synced_at
  }
```

Level 1 may rely on Redis + live adapter without a full airport table; if introduced, migrations are versioned inside this service only.

## Notification DB

```mermaid
erDiagram
  NOTIFICATION_RECORDS {
    uuid id PK
    uuid itinerary_id
    varchar event_id UK
    varchar channel
    varchar status
    text detail
    timestamptz created_at
  }
```
