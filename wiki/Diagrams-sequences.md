> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Diagramas de secuencia

## Crear itinerario (camino síncrono + notificación async)

```mermaid
sequenceDiagram
  actor U as Usuario
  participant W as Next.js
  participant G as API Gateway
  participant I as Itinerary Service
  participant A as Airport Service
  participant DB as Postgres Itinerary
  participant R as Outbox Relay
  participant Q as RabbitMQ
  participant F as Función de notificación

  U->>W: Enviar itinerario
  W->>G: POST /itineraries + JWT
  G->>I: Reenviar + JWT
  I->>A: GET /airports/{origin}
  A-->>I: 200 Airport
  I->>A: GET /airports/{destination}
  A-->>I: 200 Airport
  I->>DB: BEGIN tx insert itinerary + outbox
  DB-->>I: COMMIT
  I-->>G: 201 Created
  G-->>W: 201
  W-->>U: Éxito

  R->>DB: Consultar outbox no publicado
  R->>Q: Publicar ItineraryCreated
  Q->>F: Entregar evento
  F->>F: Simular aviso y persistir historial
```

## Carga del mapa (aeropuertos)

```mermaid
sequenceDiagram
  actor U as Usuario
  participant W as Next.js + Leaflet
  participant G as API Gateway
  participant A as Airport Service
  participant C as Redis
  participant X as API Colombia

  U->>W: Abrir mapa
  W->>G: GET /airports?for=map
  G->>A: Reenviar
  A->>C: GET caché
  alt acierto de caché
    C-->>A: payload
  else fallo de caché
    A->>X: fetch HTTP
    X-->>A: JSON externo
    A->>A: Adapter a dominio/DTO
    A->>C: SET TTL
  end
  A-->>G: 200 DTO listo para el mapa
  G-->>W: 200
  W-->>U: Dibujar marcadores
```

## Demo de resiliencia (circuit breaker)

```mermaid
sequenceDiagram
  participant A as Airport Service
  participant X as API Colombia
  participant CB as Circuit Breaker

  loop fallos
    A->>CB: ¿permitir?
    CB-->>A: cerrado/half-open
    A->>X: fetch
    X-->>A: timeout/5xx
    A->>CB: registrar fallo
  end
  A->>CB: ¿permitir?
  CB-->>A: abierto
  A-->>A: fail fast / fallback + métrica
```
