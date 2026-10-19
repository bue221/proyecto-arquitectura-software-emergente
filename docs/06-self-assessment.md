# Self-assessment — Levels 1 / 2 / 3

Update this table in PRs as criteria are met. Status: `pending` | `partial` | `done`.

## Level 1 — Base

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Adapter pattern | pending | |
| Hexagonal layers | pending | |
| DDD BCs + ubiquitous language | done (docs) | `docs/01-architecture/bounded-contexts.md` |
| Itinerary CRUD + HTTP airport validation | pending | |
| Relational DB | pending | |
| Versioned migrations | pending | |
| Swagger per service | pending | |
| Proper HTTP errors | pending | |
| Structured logs + correlation | pending | |
| Frontend Plotly map | pending | |
| Docker Compose | pending | |
| README + diagrams | done (docs) | `docs/03-diagrams/*` |

## Level 2 — Advanced

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Circuit breaker | pending | |
| Retry + backoff | pending | |
| Redis cache | pending | |
| API Gateway + rate limit + JWT | pending | |
| Notification consumer | pending | |
| Broker RabbitMQ | pending | |
| AsyncAPI | pending | |
| OTel + Jaeger | pending | |
| JWT propagation | pending | |
| E2E Testcontainers | pending | |
| Controlled failure demo | pending | |

## Level 3 — Expert

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Transactional Outbox | pending | ADR-0005 + diagram |
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
