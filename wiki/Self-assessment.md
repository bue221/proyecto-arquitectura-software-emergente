# Autoevaluación — Niveles 1 / 2 / 3

Actualiza esta tabla en los PRs a medida que se cumplen criterios. Estado: `pendiente` | `parcial` | `hecho`.

## Nivel 1 — Base

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| Patrón Adapter | hecho | `services/airport-service/internal/adapters/out/colombia` |
| Capas hexagonales | hecho | Airport + Itinerary: `domain` / `application` / `adapters` |
| BCs DDD + lenguaje ubicuo | hecho (docs) | `docs/01-architecture/bounded-contexts.md` |
| CRUD de itinerario + validación HTTP de aeropuertos | hecho | `services/itinerary-service` + panel de UI |
| BD relacional | hecho | Postgres `itinerary-db` (una BD para el servicio de itinerarios) |
| Migraciones versionadas | hecho | `services/itinerary-service/migrations` aplicadas al arrancar |
| Swagger por servicio | hecho | Airport + Itinerary `/swagger` + contratos OpenAPI |
| Errores HTTP correctos | hecho | Problem JSON en ambos servicios |
| Logs estructurados + correlación | hecho | Logs JSON + `X-Trace-Id` en ambos servicios |
| Mapa interactivo en el frontend | hecho | Studio Leaflet + wizard de viajes (`apps/web`) |
| Docker Compose | hecho | airport + itinerary-db + itinerary + web |
| README + diagramas | hecho (docs) | `docs/03-diagrams/*` |

## Nivel 2 — Avanzado

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| Circuit breaker | hecho | `adapters/out/resilience` + adapter Colombia; `GET /api/v1/resilience` |
| Retry + backoff | hecho | exponencial + full jitter en `resilience/retry.go` |
| Caché Redis | hecho | `adapters/out/rediscache` + Compose `redis`; fallback en memoria |
| API Gateway + rate limit + JWT | hecho | `services/api-gateway` `:8080`; los itinerarios exigen Bearer |
| Consumidor de notificaciones | hecho | `services/notification-function`: consumidor de cola + persistencia idempotente |
| Bróker RabbitMQ | hecho | Compose `rabbitmq` + exchange `itinerary.events` |
| AsyncAPI | hecho | `packages/contracts/asyncapi/itinerary-events.yaml` v0.2.0 |
| OTel + Jaeger | hecho | Compose `jaeger`; OTLP desde Gateway/Airport/Itinerary; UI `:16686` |
| Propagación de JWT | hecho | El Gateway valida el JWT y reenvía `Authorization` + `X-User-*` |
| E2E Testcontainers | hecho | `repository_integration_test.go` + `.github/workflows/e2e-nightly.yml` |
| Demo de fallo controlado | hecho | `GET /api/v1/demo/fail` → 503 + span de error (`docs/05-runbooks/observability.md`) |

## Nivel 3 — Experto

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| Transactional Outbox | hecho | Create + outbox en la misma TX; el relay publica y luego marca `published_at` |
| Resolución del double-write documentada | hecho (docs) | `docs/03-diagrams/outbox.md` |
| gRPC Airport ↔ Itinerary | hecho | RPC `EnsureExists`; Itinerary prefiere `AIRPORT_GRPC_ADDR` |
| Seguridad S2S (mTLS u OAuth2 CC) | hecho | mTLS de Compose en gRPC; certs en `infra/certs/grpc` (ADR-0009) |
| Vault / config server | hecho | `CONFIG_FILE` + Vault KV opcional (`infra/vault/README.md`) |
| Caos (Toxiproxy/Chaos Mesh) | hecho | Compose `toxiproxy` + demo de latencia en `infra/toxiproxy/` |
| Bulkhead | hecho | `resilience.Bulkhead` en el adapter Colombia; `BULKHEAD_MAX_CONCURRENT` |
| Alertas Prometheus | hecho | `/metrics` + `infra/prometheus/alerts.yml` (CB abierto, bulkhead) |
| CI/CD GitHub Actions | hecho | `ci.yml` (≤3 min) + `e2e-nightly.yml` Testcontainers |
| Kubernetes + probes | hecho | `infra/k8s/*` Deployments con probes `/ready` y `/live` |
| Pruebas de contrato (Pact) | hecho | `packages/contracts/pact/Airport-Itinerary.json` + tests consumer/provider |
| Versionado de API + paginación | hecho | `/api/v1` + header `API-Version`; listado `page` / `pageSize` (ADR-0008) |

## Backlog de planificación (Jira)

Épicas: docs de Fase 0 (esto), servicios N1, resiliencia/eventos N2, endurecimiento N3. Exporta o captura el tablero en `docs/05-runbooks/` cuando exista, para el paquete de entrega.
