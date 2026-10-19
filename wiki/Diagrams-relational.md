> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Modelo relacional (por servicio)

Las bases **no se comparten**. Los diagramas de abajo son esquemas lógicos de cada servicio.

## BD de Itinerary Service

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

  ITINERARIES ||--o{ OUTBOX : "crea eventos para"
```

## BD de Airport Service (persistencia o espejo opcional)

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

El Nivel 1 puede apoyarse en Redis + el adapter en vivo, sin una tabla completa de aeropuertos. Si se introduce, las migraciones se versionan solo dentro de este servicio.

## BD de notificaciones

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
