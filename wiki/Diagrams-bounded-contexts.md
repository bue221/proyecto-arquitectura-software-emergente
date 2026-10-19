> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Diagrama de contextos delimitados

La narración está en [Bounded-contexts](Bounded-contexts).

```mermaid
flowchart TB
  subgraph ACL [Capa anticorrupción]
    ADP[Adapter Colombia]
  end

  subgraph CAT [BC Catálogo de aeropuertos]
    A1[Agregado / entidad Airport]
    P1[Puerto AirportProvider]
  end

  subgraph PLAN [BC Planificación de itinerarios]
    I1[Agregado Itinerary]
    REF[VO AirportRef]
    OB[Outbox]
  end

  subgraph NOTIF [BC Notificación]
    N1[NotificationRecord]
  end

  EXT[API Colombia] --> ADP
  ADP --> P1
  P1 --> A1
  I1 --> REF
  REF -.->|solo identidad| A1
  I1 --> OB
  OB -->|ItineraryCreated| N1
```
