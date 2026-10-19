# Vision & scope

## Problem

Travelers planning trips inside Colombia need a reliable way to:

- Discover real airports (validated against a public data source).
- Visualize them on a map.
- Build personal itineraries (origin, destination, date, duration).
- Receive asynchronous confirmation when an itinerary is created.

The system must behave like a **real distributed platform**: isolation, resilience, observability, and safe async integration.

## Solution (one sentence)

A monorepo platform with a Next.js map UI and Go microservices that adapt external airport data, persist itineraries with hexagonal boundaries, and notify users through event-driven serverless functions.

## In scope

| Area | Scope |
|------|--------|
| Airport catalog | Consume API Colombia via Adapter; Redis cache; Plotly map |
| Itineraries | Full CRUD; validate airports over HTTP (L1) / optimized copy or gRPC (L2/L3) |
| Async notify | `ItineraryCreated` → FaaS notification + history DB |
| Edge | API Gateway: routing, rate limit, JWT propagation |
| Ops | Docker Compose; structured logs; OTel/Jaeger; Prometheus (L2+) |
| Level 3 | Transactional Outbox, gRPC, CI/CD, K8s probes, contract tests, chaos/alerting samples |

## Out of scope (YAGNI for now)

- Real email provider production accounts (simulate + persist history).
- Multi-region active-active.
- Native mobile apps.
- Flight prices / booking with airlines.
- Shared database across services.

## Success metrics (course)

- Levels 1–3 checklist green in [`06-self-assessment.md`](06-self-assessment.md).
- Demo script runnable with screenshots/video evidence.
- Wiki + ADRs explain Adapter, Outbox, and double-write resolution.

## Personas

| Persona | Need |
|---------|------|
| Traveler | Create and manage itineraries; see airports on a map |
| Operator / SRE | Traces, metrics, alerts, safe deploys |
| Reviewer (course) | Clear docs, PRs, Swagger, tests, architecture alignment |
