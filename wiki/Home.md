# Plataforma de itinerarios personales — Wiki

Bienvenido a la **GitHub Wiki** del monorepo **RutaCO** (itinerarios personales + aeropuertos de Colombia).

**Idioma:** esta wiki se escribe en **español**. Los nombres de página, rutas, comandos e identificadores de código se mantienen en inglés para no romper enlaces.

La documentación se versiona en el repositorio (`docs/` + `wiki/`) mediante **branch → PR → merge → `make wiki`**. No editar solo en la UI de GitHub.

## Regla dura — cada PR actualiza la wiki

Todo PR que cambie comportamiento, arquitectura, UI u ops debe:

1. Actualizar `docs/**` en el mismo PR (puede seguir en inglés).
2. Espejar en `wiki/**` en el mismo PR, con la prosa en **español** y los nombres de archivo sin cambiar.
3. Tras el merge a `main`: `make wiki` (o `./scripts/publish-wiki.sh`).

Detalle: [`AGENTS.md`](https://github.com/bue221/proyecto-arquitectura-software-emergente/blob/main/AGENTS.md) · [Branching](Branching) · [PR-checklist](PR-checklist)

## Estado de entrega

### Hecho (Niveles 1–3)

| Área | Notas |
|------|--------|
| Nivel 1 | Airport + Itinerary hexagonales, Compose, Swagger, migraciones |
| Frontend | Studio Leaflet + tile Adapter, wizard de viajes, packing, SEO; preferencias de mapa en `/profile` |
| Nivel 2 | Gateway + Redis/CB + RabbitMQ/notify + OTel/Jaeger + Testcontainers |
| Nivel 3 | gRPC mTLS, paginación, bulkhead, Prometheus, Toxiproxy, probes K8s, Pact, Vault/config, CI |
| Ops local | `make up` / `make down` / `make smoke` / `make wiki` |

Tabla detallada: [Self-assessment](Self-assessment) · [Kubernetes](Kubernetes)

## Enlaces rápidos

| Recurso | Enlace |
|---------|--------|
| Código | [Repositorio](https://github.com/bue221/proyecto-arquitectura-software-emergente) |
| Docs en el repo | [`docs/`](https://github.com/bue221/proyecto-arquitectura-software-emergente/tree/main/docs) |
| Agentes | [`AGENTS.md`](https://github.com/bue221/proyecto-arquitectura-software-emergente/blob/main/AGENTS.md) |
| Setup local | [Local-setup](Local-setup) |

## Arquitectura

- [Vision](Vision)
- [Architecture-overview](Architecture-overview)
- [Architecture-document](Architecture-document)
- [Bounded-contexts](Bounded-contexts)
- [ADRs](ADRs)

## Servicios

- [API-gateway](API-gateway) — borde Nivel 2 (`:8080`)
- [Airport-service](Airport-service) — Nivel 1 listo (`:8081`)
- [Itinerary-service](Itinerary-service) — Nivel 1 listo (`:8082`, Postgres `:5434`)
- [Notification-function](Notification-function) — Nivel 2 listo (`:8083`)

## Diagramas

- [Diagrams-index](Diagrams-index)
- [Diagrams-components](Diagrams-components)
- [Diagrams-sequences](Diagrams-sequences)
- [Diagrams-adapter](Diagrams-adapter)
- [Diagrams-outbox](Diagrams-outbox)
- [Diagrams-deployment](Diagrams-deployment)

## Frontend

- [Frontend-architecture](Frontend-architecture) — Studio Leaflet + viajes + SEO

## DevOps

- [Branching](Branching) — branch → PR → merge → wiki
- [PR-checklist](PR-checklist)
- [CI-CD](CI-CD)
- [Quality](Quality)

## Ops y calificación

- [Local-setup](Local-setup)
- [Observability](Observability)
- [Demo-script](Demo-script)
- [Self-assessment](Self-assessment)
