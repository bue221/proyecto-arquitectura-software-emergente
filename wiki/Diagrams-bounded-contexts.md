> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Bounded contexts diagram

See also the narrative in [`../01-architecture/bounded-contexts.md`](../01-architecture/bounded-contexts.md).

```mermaid
flowchart TB
  subgraph ACL [Anti-Corruption Layer]
    ADP[Colombia Adapter]
  end

  subgraph CAT [Airport Catalog BC]
    A1[Airport aggregate / entity]
    P1[AirportProvider port]
  end

  subgraph PLAN [Itinerary Planning BC]
    I1[Itinerary aggregate]
    REF[AirportRef VO]
    OB[Outbox]
  end

  subgraph NOTIF [Notification BC]
    N1[NotificationRecord]
  end

  EXT[API Colombia] --> ADP
  ADP --> P1
  P1 --> A1
  I1 --> REF
  REF -.->|identity only| A1
  I1 --> OB
  OB -->|ItineraryCreated| N1
```
