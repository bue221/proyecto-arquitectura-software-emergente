# AGENTS.md — Personal Itineraries Platform

Instructions for humans and AI coding agents working in this repository.

## Why this project exists

Academic semester challenge: a **personal travel itineraries** platform that combines three architectures in one monorepo:

1. **Microservices** — Airport Service + Itinerary Service (hexagonal per service)
2. **Event-driven** — `ItineraryCreated` via message broker + Transactional Outbox
3. **Serverless** — notification/report functions triggered by events (LocalStack / OpenFaaS locally)

**Target grade band:** Level 1 + Level 2 + Level 3 (expert).

This is **not** related to the Parche product. Domain = Colombian airports + personal itineraries.

## Stack (locked decisions)

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | Next.js (App Router) + Plotly.js | SSR-friendly UI; interactive airport map |
| Backend | Go | Low CPU/memory under concurrency |
| Gateway | Go (Traefik or custom BFF) | Single entry; rate limit; JWT propagation; no business logic |
| DB | PostgreSQL (one DB per service) | Relational + versioned migrations |
| Cache | Redis | Airport API cache + resilience |
| Broker | RabbitMQ | Async notifications; AsyncAPI contract |
| Observability | OpenTelemetry + Jaeger, Prometheus + Grafana | Traces, metrics, alerts |
| Orchestration | Docker Compose (local); Kubernetes (Level 3) | Full-stack demos |
| CI/CD | GitHub Actions | Build, test, SonarQube, deploy example |

See ADRs under [`docs/01-architecture/adr/`](docs/01-architecture/adr/).

## Monorepo layout

```text
apps/web/                      # Next.js frontend (Plotly map)
services/api-gateway/          # BFF / edge routing
services/airport-service/      # Adapter to API Colombia + Redis
services/itinerary-service/    # CRUD + Outbox + HTTP/gRPC to Airport
services/notification-function/# FaaS consumers (LocalStack/OpenFaaS)
packages/contracts/openapi/    # REST contracts
packages/contracts/asyncapi/   # Event contracts
packages/proto/                # gRPC/Protobuf (Level 3)
infra/docker/                  # Compose overlays
infra/k8s/                     # Deployments, probes (Level 3)
docs/                          # Project wiki (source of truth)
```

## Documentation map (read before coding)

| Topic | Path |
|-------|------|
| Wiki home | [`docs/README.md`](docs/README.md) |
| Vision & scope | [`docs/00-vision.md`](docs/00-vision.md) |
| Architecture overview | [`docs/01-architecture/overview.md`](docs/01-architecture/overview.md) |
| Formal architecture doc | [`docs/01-architecture/document.md`](docs/01-architecture/document.md) |
| DDD bounded contexts | [`docs/01-architecture/bounded-contexts.md`](docs/01-architecture/bounded-contexts.md) |
| ADRs | [`docs/01-architecture/adr/`](docs/01-architecture/adr/) |
| Airport service | [`docs/02-services/airport-service.md`](docs/02-services/airport-service.md) |
| Itinerary service | [`docs/02-services/itinerary-service.md`](docs/02-services/itinerary-service.md) |
| Notifications FaaS | [`docs/02-services/notification-function.md`](docs/02-services/notification-function.md) |
| Mermaid diagrams | [`docs/03-diagrams/`](docs/03-diagrams/) |
| Branching & PRs | [`docs/04-devops/branching.md`](docs/04-devops/branching.md) |
| PR checklist | [`docs/04-devops/pr-checklist.md`](docs/04-devops/pr-checklist.md) |
| CI/CD | [`docs/04-devops/ci-cd.md`](docs/04-devops/ci-cd.md) |
| Local setup | [`docs/05-runbooks/local-setup.md`](docs/05-runbooks/local-setup.md) |
| Demo script (rubric evidence) | [`docs/05-runbooks/demo-script.md`](docs/05-runbooks/demo-script.md) |
| Self-assessment Levels 1–3 | [`docs/06-self-assessment.md`](docs/06-self-assessment.md) |

## Mandatory Git workflow

1. Never push business changes directly to `main`.
2. Create a branch from an up-to-date `main`:
   - `feat/<scope>-<short-slug>`
   - `fix/<scope>-<short-slug>`
   - `docs/<short-slug>`
   - `chore/<short-slug>`
   - `refactor/<scope>-<short-slug>`
3. Open a **Pull Request** that closes the work unit.
4. PR must link related docs / ADR / issue when architecture changes.
5. Commits: [Conventional Commits](https://www.conventionalcommits.org/) in **English**  
   Example: `feat(airport): add Colombia API adapter port`

Full rules: [`docs/04-devops/branching.md`](docs/04-devops/branching.md).

## Architecture rules agents must not break

- **Hexagonal per Go service:** `domain` → `application` → `adapters/in` (HTTP/gRPC) / `adapters/out` (DB, HTTP, broker). Domain has zero infra imports.
- **Adapter pattern** for external API Colombia: Port in domain; Adapter in infrastructure; frontend never calls the external API.
- **One database per service.** No shared DB schemas across services.
- **Gateway has no business logic** — routing, auth propagation, rate limiting only.
- **Double-write:** Itinerary persistence + event publish must use **Transactional Outbox** (Level 3), not dual writes.
- Prefer **small PRs**. Do not mix Level 3 infrastructure with unrelated feature work.
- Update `docs/` in the **same PR** when behavior or architecture changes.
- Do not invent new services without an ADR.

## Error handling & observability (non-negotiables)

- Consistent HTTP problem responses (status + machine-readable code + safe user message).
- Structured JSON logs with `trace_id` / `span_id` (OpenTelemetry).
- External calls: timeouts, retries with exponential backoff + jitter, circuit breaker (Level 2+).
- Never swallow errors silently; wrap with context for operators, sanitize for end users.

## Performance constraints (context)

- Airport list / map payloads should prefer Redis cache hits for repeated external fetches.
- QR/validation-style hot paths do not apply here; hot path is **create itinerary → validate airports → outbox → notify**.
- Prefer efficient Go structures and bounded DB queries; avoid N+1 HTTP fan-out without caching.

## How to work as an agent (default loop)

1. Read the relevant `docs/` page + ADR for the area you touch.
2. Branch → implement → tests → update docs if needed → PR-ready summary.
3. Prefer completing one service vertical slice over scattering incomplete stubs.

## What is intentionally not implemented yet (Phase 0)

Phase 0 delivers **architecture + wiki + workflow only**. Application code, Compose stacks, and CI jobs land in later PRs following this documentation.
