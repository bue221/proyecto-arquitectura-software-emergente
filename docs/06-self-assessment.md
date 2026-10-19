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
| Frontend Plotly map | done | `apps/web` map + itinerary form |
| Docker Compose | done | airport + itinerary-db + itinerary + web |
| README + diagrams | done (docs) | `docs/03-diagrams/*` |

## Level 2 — Advanced

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Circuit breaker | pending | |
| Retry + backoff | pending | |
| Redis cache | pending | |
| API Gateway + rate limit + JWT | done | `services/api-gateway` `:8080`; itineraries require Bearer |
| Notification consumer | pending | |
| Broker RabbitMQ | pending | |
| AsyncAPI | pending | draft in `packages/contracts/asyncapi` |
| OTel + Jaeger | pending | |
| JWT propagation | done | Gateway validates JWT and forwards `Authorization` + `X-User-*` |
| E2E Testcontainers | pending | |
| Controlled failure demo | pending | |

## Level 3 — Expert

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Transactional Outbox | partial | Create writes outbox row in same TX; relay/broker pending |
| Double-write resolution documented | done (docs) | `docs/03-diagrams/outbox.md` |
| gRPC Airport ↔ Itinerary | pending | |
| S2S security (mTLS or OAuth2 CC) | pending | |
| Vault / config server | pending | |
| Chaos (Toxiproxy/Chaos Mesh) | pending | |
| Bulkhead | pending | |
| Prometheus alerting | pending | |
| CI/CD GitHub Actions | pending | |
| Kubernetes + probes | pending | |
| Contract testing (Pact) | pending | |
| API versioning + pagination | pending | |

## Planning backlog (Jira)

Track epics: Phase 0 docs (this), L1 services, L2 resilience/events, L3 hardening. Export or screenshot the board into `docs/05-runbooks/` when available for the delivery pack.
