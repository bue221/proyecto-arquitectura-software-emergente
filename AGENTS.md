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
| Wiki home (repo docs) | [`docs/README.md`](docs/README.md) |
| GitHub Wiki (published) | https://github.com/bue221/proyecto-arquitectura-software-emergente/wiki |
| Wiki seed pages | [`wiki/`](wiki/) |
| Publish wiki script | [`scripts/publish-wiki.sh`](scripts/publish-wiki.sh) |
| Frontend architecture | [`docs/07-frontend/architecture.md`](docs/07-frontend/architecture.md) |
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

## Mandatory Git workflow (HARD RULE — no exceptions)

**Every change must follow this loop. No direct commits or pushes to `main`.**

```text
update main → create branch → commit on branch → open PR → review → merge PR into main
```

This applies to **everything**: features, fixes, docs (`AGENTS.md` included), chores, refactors, CI, and agent-driven edits.

1. Sync `main` (`git checkout main && git pull`).
2. Create a branch from up-to-date `main`:
   - `feat/<scope>-<short-slug>`
   - `fix/<scope>-<short-slug>`
   - `docs/<short-slug>`
   - `chore/<short-slug>`
   - `refactor/<scope>-<short-slug>`
   - `test/<scope>-<short-slug>`
3. Commit only on that branch (Conventional Commits in **English**).  
   Example: `feat(airport): add Colombia API adapter port`
4. Push the branch and open a **Pull Request** targeting `main`.
5. The work is done only when the **PR is merged** into `main` (not when the branch exists locally).
6. PR must link related docs / ADR / issue when architecture or public behavior changes.
7. After merge, delete the feature branch when appropriate and continue from `main`.

**Forbidden**

- Committing straight to `main`
- Pushing to `main` without a PR
- Opening a branch and leaving changes unmerged without a PR
- Squashing unrelated work into `main` outside a PR

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
2. **Always** create a branch from `main` before editing files.
3. Implement → tests → update docs if needed.
4. Push branch → open PR → **merge into `main`** (or leave the PR ready if the user must approve).
5. Prefer completing one service vertical slice over scattering incomplete stubs.

## Delivery status

- Phase 0 wiki/ADRs: done
- Level 1 Airport + Itinerary + Compose + Next.js map/CRUD: done
- Frontend design system (shadcn + Sonner + feature folders): done
- Level 2 API Gateway (JWT + rate limit): done
- Level 2 Redis cache + circuit breaker + retry on Airport: done / in this PR
- Local stack: `make up` / `make down` / `make smoke`
- Remaining Level 2+ (RabbitMQ notify, FaaS, Jaeger, Testcontainers): next

Remaining work continues **only** through branch → PR → merge.
