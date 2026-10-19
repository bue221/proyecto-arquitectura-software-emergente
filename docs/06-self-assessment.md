# Self-assessment — Levels 1 / 2 / 3

Update this table in PRs as criteria are met. Status: `pending` | `partial` | `done`.

## Level 1 — Base

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Adapter pattern | done | `services/airport-service/internal/adapters/out/colombia` |
| Hexagonal layers | done | Airport + Itinerary `domain`/`application`/`adapters` |
| DDD BCs + ubiquitous language | done (docs) | `docs/01-architecture/bounded-contexts.md` |
| Itinerary CRUD + HTTP airport validation | done | `services/itinerary-service` + UI panel |
| Relational DB | done | Postgres `itinerary-db` (one DB for itinerary service) |
| Versioned migrations | done | `services/itinerary-service/migrations` applied on boot |
| Swagger per service | done | Airport + Itinerary `/swagger` + OpenAPI contracts |
| Proper HTTP errors | done | Problem JSON on both services |
| Structured logs + correlation | done | JSON logs + `X-Trace-Id` on both services |
| Frontend interactive map | done | Leaflet Studio + trips wizard (`apps/web`) |
| Docker Compose | done | airport + itinerary-db + itinerary + web |
| README + diagrams | done (docs) | `docs/03-diagrams/*` |

## Level 2 — Advanced

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Circuit breaker | done | `adapters/out/resilience` + Colombia adapter; `GET /api/v1/resilience` |
| Retry + backoff | done | exponential + full jitter in `resilience/retry.go` |
| Redis cache | done | `adapters/out/rediscache` + Compose `redis`; memory fallback |
| API Gateway + rate limit + JWT | done | `services/api-gateway` `:8080`; itineraries require Bearer |
| Notification consumer | done | `services/notification-function` queue consumer + idempotent persist |
| Broker RabbitMQ | done | Compose `rabbitmq` + exchange `itinerary.events` |
| AsyncAPI | done | `packages/contracts/asyncapi/itinerary-events.yaml` v0.2.0 |
| OTel + Jaeger | done | Compose `jaeger`; OTLP from Gateway/Airport/Itinerary; UI `:16686` |
| JWT propagation | done | Gateway validates JWT and forwards `Authorization` + `X-User-*` |
| E2E Testcontainers | done | `repository_integration_test.go` + `.github/workflows/e2e-nightly.yml` |
| Controlled failure demo | done | `GET /api/v1/demo/fail` → 503 + error span (`docs/05-runbooks/observability.md`) |

## Level 3 — Expert

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Transactional Outbox | done | Create + outbox same TX; relay publishes then marks `published_at` |
| Double-write resolution documented | done (docs) | `docs/03-diagrams/outbox.md` |
| gRPC Airport ↔ Itinerary | done | `EnsureExists` RPC; Itinerary prefers `AIRPORT_GRPC_ADDR` |
| S2S security (mTLS or OAuth2 CC) | partial | local insecure gRPC; mTLS later |
| Vault / config server | pending | |
| Chaos (Toxiproxy/Chaos Mesh) | pending | |
| Bulkhead | pending | |
| Prometheus alerting | pending | |
| CI/CD GitHub Actions | partial | `.github/workflows/ci.yml` — Go unit tests only, ≤3 min |
| Kubernetes + probes | pending | |
| Contract testing (Pact) | pending | |
| API versioning + pagination | pending | |

## Planning backlog (Jira)

Track epics: Phase 0 docs (this), L1 services, L2 resilience/events, L3 hardening. Export or screenshot the board into `docs/05-runbooks/` when available for the delivery pack.
