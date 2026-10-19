# Personal Itineraries Platform — Wiki

Bienvenido a la **GitHub Wiki** del monorepo **RutaCO** (itinerarios personales + aeropuertos Colombia).

La documentación se versiona en el repositorio (`docs/` + `wiki/`) mediante **branch → PR → merge → `make wiki`**. No editar solo en la UI de GitHub.

## Hard rule — cada PR actualiza la wiki

Todo PR que cambie comportamiento, arquitectura, UI u ops debe:

1. Actualizar `docs/**` en el mismo PR
2. Espejar en `wiki/**` en el mismo PR
3. Tras merge a `main`: `make wiki` (o `./scripts/publish-wiki.sh`)

Detalle: [`AGENTS.md`](https://github.com/bue221/proyecto-arquitectura-software-emergente/blob/main/AGENTS.md) · [Branching](Branching) · [PR-checklist](PR-checklist)

## Estado de entrega

### Hecho

| Área | Notas |
|------|--------|
| Level 1 | Airport + Itinerary hexagonales, Compose, Swagger, migraciones |
| Frontend | Studio Leaflet + tile Adapter, trips wizard (planes), packing, SEO |
| Level 2 (parcial) | Gateway JWT + rate limit; Redis + circuit breaker + retry |
| Ops local | `make up` / `make down` / `make smoke` / `make wiki` |

### Siguiente (prioridad)

1. RabbitMQ + AsyncAPI + notification FaaS
2. OpenTelemetry + Jaeger (+ demo de fallo controlado)
3. E2E Testcontainers
4. Outbox relay → broker (completar transactional outbox)
5. gRPC Airport ↔ Itinerary + S2S auth
6. CI/CD GitHub Actions + Kubernetes probes
7. Chaos / bulkhead / Prometheus / Pact (según rúbrica)

Tabla detallada: [Self-assessment](Self-assessment)

## Quick links

| Recurso | Link |
|---------|------|
| Código | [Repositorio](https://github.com/bue221/proyecto-arquitectura-software-emergente) |
| Docs en repo | [`docs/`](https://github.com/bue221/proyecto-arquitectura-software-emergente/tree/main/docs) |
| Agents | [`AGENTS.md`](https://github.com/bue221/proyecto-arquitectura-software-emergente/blob/main/AGENTS.md) |
| Setup local | [Local-setup](Local-setup) |

## Architecture

- [Vision](Vision)
- [Architecture-overview](Architecture-overview)
- [Architecture-document](Architecture-document)
- [Bounded-contexts](Bounded-contexts)
- [ADRs](ADRs)

## Services

- [API-gateway](API-gateway) — Level 2 edge (`:8080`)
- [Airport-service](Airport-service) — Level 1 done (`:8081`)
- [Itinerary-service](Itinerary-service) — Level 1 done (`:8082`, Postgres `:5434`)
- [Notification-function](Notification-function) — planned Level 2

## Diagrams

- [Diagrams-index](Diagrams-index)
- [Diagrams-components](Diagrams-components)
- [Diagrams-sequences](Diagrams-sequences)
- [Diagrams-adapter](Diagrams-adapter)
- [Diagrams-outbox](Diagrams-outbox)
- [Diagrams-deployment](Diagrams-deployment)

## Frontend

- [Frontend-architecture](Frontend-architecture) — Leaflet Studio + trips + SEO

## DevOps

- [Branching](Branching) — branch → PR → merge → wiki
- [PR-checklist](PR-checklist)
- [CI-CD](CI-CD)
- [Quality](Quality)

## Ops & grading

- [Local-setup](Local-setup)
- [Demo-script](Demo-script)
- [Self-assessment](Self-assessment)
