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
| Frontend | Studio Leaflet + tile Adapter, trips wizard, packing, SEO; map prefs en `/profile` |
| Level 2 | Gateway + Redis/CB + RabbitMQ/notify + OTel/Jaeger |
| Level 3 (parcial) | gRPC `EnsureExists` + CI tests ≤3 min |
| Ops local | `make up` / `make down` / `make smoke` / `make wiki` |

### Siguiente (prioridad)

1. E2E Testcontainers (opcional / nightly — CI de PR se mantiene bajo 3 min)
2. mTLS / auth S2S en gRPC
3. Kubernetes probes + ampliar CI/CD (imágenes / Sonar)
4. Chaos / bulkhead / Prometheus / Pact / OpenFaaS packaging (según rúbrica)

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
- [Notification-function](Notification-function) — Level 2 done (`:8083`)

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
- [Observability](Observability)
- [Demo-script](Demo-script)
- [Self-assessment](Self-assessment)
