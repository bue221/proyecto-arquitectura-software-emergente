> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Vistas de despliegue

## Local (Docker Compose) — objetivo

```mermaid
flowchart TB
  subgraph host [Máquina de desarrollo]
    WEB[web:3000]
    GW[gateway:8080]
    AIR[airport-service]
    ITI[itinerary-service]
    RELAY[outbox-relay]
    FAAS[notification-faas]
    PG1[(pg-airport)]
    PG2[(pg-itinerary)]
    PG3[(pg-notify)]
    REDIS[(redis)]
    RMQ[[rabbitmq]]
    OTEL[otel-collector]
    JAEGER[jaeger]
    PROM[prometheus]
    GRAF[grafana]
  end

  WEB --> GW
  GW --> AIR
  GW --> ITI
  ITI --> AIR
  ITI --> PG2
  RELAY --> PG2
  RELAY --> RMQ
  AIR --> REDIS
  AIR --> PG1
  RMQ --> FAAS
  FAAS --> PG3
  AIR --> OTEL
  ITI --> OTEL
  GW --> OTEL
  OTEL --> JAEGER
  PROM --> GRAF
```

Los archivos de Compose viven en `infra/docker/`.

## Kubernetes (Nivel 3 — objetivo)

```mermaid
flowchart LR
  ING[Ingress] --> GW[Deploy gateway]
  GW --> AIR[Deploy airport]
  GW --> ITI[Deploy itinerary]
  ITI --> AIR
  AIR --> REDIS
  ITI --> PG2
  AIR --> PG1
  FAAS[Job/función notify] --> PG3
  RMQ[[RabbitMQ]]
  ITI --> RMQ
  RMQ --> FAAS
```

Cada Deployment expone probes de **readiness** y **liveness**. El detalle está en `infra/k8s/`.
