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
| Frontend | Next.js 15 App Router + TypeScript | SSR metadata / SEO; App Router routes |
| UI | Tailwind v4 + shadcn/ui + Framer Motion | Premium travel UX (slate / emerald / indigo) |
| Map | React-Leaflet + **tile Adapter port** | Free basemaps (CARTO/OSM/OpenTopo/Esri); swap without keys |
| Backend | Go | Low CPU/memory under concurrency |
| Gateway | Go (custom BFF) | Single entry; rate limit; JWT propagation; no business logic |
| DB | PostgreSQL (one DB per service) | Relational + versioned migrations |
| Cache | Redis | Airport API cache + resilience |
| Broker | RabbitMQ | Async notifications; AsyncAPI contract |
| Observability | OpenTelemetry + Jaeger, Prometheus + Grafana | Traces, metrics, alerts |
| Orchestration | Docker Compose (local); Kubernetes (Level 3) | Full-stack demos |
| CI/CD | GitHub Actions | Build, test, SonarQube, deploy example |

See ADRs under [`docs/01-architecture/adr/`](docs/01-architecture/adr/).  
Frontend UI details: [`docs/07-frontend/architecture.md`](docs/07-frontend/architecture.md).

## Frontend UI architecture (agents must follow)

Product brand in UI: **RutaCO**.

| Surface | Pattern |
|---------|---------|
| `/` Studio | Full-bleed Leaflet map + floating glass panel; map click = origin → destination + curved route |
| `/trips` | **Two-step wizard**: (1) route/date (2) optional destination **plans** + recommendations; varied trip cards |
| `/trips/[id]` | Plans summary + packing checklist |
| Auth | Demo login → Gateway `POST /auth/token`; profile in `localStorage` |
| SEO | Root `metadata` / OG / Twitter, `sitemap.ts`, `robots.ts`, JSON-LD; `NEXT_PUBLIC_SITE_URL` |
| Map tiles | Port `MapTileProvider` + adapters under `apps/web/src/features/studio/map/` — never hard-code a CDN in map logic |

Do **not** reintroduce Plotly as the primary studio map. Do **not** call `api-colombia.com` from the browser.

## Monorepo layout

```text
apps/web/                      # Next.js — Studio (Leaflet) + trips wizard + SEO
services/api-gateway/          # BFF / edge routing
services/airport-service/      # Adapter to API Colombia + Redis
services/itinerary-service/    # CRUD + packing + planItems + Outbox
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
update main → create branch → commit on branch → open PR → review → merge PR into main → publish wiki
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
8. **Publish the GitHub Wiki** after merge when `wiki/` changed (see below).

**Forbidden**

- Committing straight to `main`
- Pushing to `main` without a PR
- Opening a branch and leaving changes unmerged without a PR
- Squashing unrelated work into `main` outside a PR
- Merging a behavior/architecture PR without updating `docs/` **and** `wiki/`

Full rules: [`docs/04-devops/branching.md`](docs/04-devops/branching.md).

## Mandatory Wiki sync (HARD RULE — every PR)

The GitHub Wiki is **not** edited only in the GitHub UI. Source of truth is the monorepo:

| Layer | Path |
|-------|------|
| Repo docs | `docs/**` |
| Wiki seed (published) | `wiki/**` |
| Publish script | `./scripts/publish-wiki.sh` or `make wiki` |

**Every PR that changes product behavior, architecture, ops, or UI must:**

1. Update the relevant page(s) under `docs/` in the **same PR**.
2. Mirror those changes into `wiki/` (same PR) — keep filenames in sync with existing wiki pages.
3. After the PR is **merged** to `main`, run `make wiki` (or `./scripts/publish-wiki.sh`) so https://github.com/bue221/proyecto-arquitectura-software-emergente/wiki stays current.

Agents closing a PR must not mark work “done” until wiki pages are updated in the PR **and** publish has been run when `wiki/` changed.

## Architecture rules agents must not break

- **Hexagonal per Go service:** `domain` → `application` → `adapters/in` (HTTP/gRPC) / `adapters/out` (DB, HTTP, broker). Domain has zero infra imports.
- **Adapter pattern** for external API Colombia: Port in domain; Adapter in infrastructure; frontend never calls the external API.
- **Adapter pattern** for map tiles on the web: Port `MapTileProvider`; free adapters only unless an ADR adds a keyed provider.
- **One database per service.** No shared DB schemas across services.
- **Gateway has no business logic** — routing, auth propagation, rate limiting only.
- **Double-write:** Itinerary persistence + event publish must use **Transactional Outbox** (Level 3), not dual writes.
- Prefer **small PRs**. Do not mix Level 3 infrastructure with unrelated feature work.
- Update `docs/` **and** matching `wiki/` pages in the **same PR** when behavior or architecture changes.
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
3. Implement → tests → update `docs/` **and** `wiki/` in the same PR.
4. Push branch → open PR → **merge into `main`** (or leave the PR ready if the user must approve).
5. After merge: `make wiki` when `wiki/` changed.
6. Prefer completing one service vertical slice over scattering incomplete stubs.

## Delivery status

**Done**

- Phase 0 wiki/ADRs
- Level 1 Airport + Itinerary + Compose + Next.js Studio/CRUD
- Frontend Studio (Leaflet + tile adapters) + trips wizard / plans / packing / SEO
- Level 2 API Gateway (JWT + rate limit) + Redis cache + CB + retry on Airport
- Local stack: `make up` / `make down` / `make smoke` / `make wiki`

**Next (priority order)**

1. Level 2 — RabbitMQ + AsyncAPI + notification FaaS consumer
2. Level 2 — OpenTelemetry + Jaeger (+ controlled failure demo)
3. Level 2 — E2E Testcontainers
4. Level 3 — Outbox relay → broker (complete transactional outbox)
5. Level 3 — gRPC Airport ↔ Itinerary + S2S auth
6. Level 3 — CI/CD (GitHub Actions) + Kubernetes probes
7. Level 3 — Chaos / bulkhead / Prometheus alerts / Pact (as needed for rubric)

Remaining work continues **only** through branch → PR → merge → wiki publish.
