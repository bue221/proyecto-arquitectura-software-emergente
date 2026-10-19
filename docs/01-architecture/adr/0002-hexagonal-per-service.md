# ADR-0002: Hexagonal architecture per Go service

- **Status:** Accepted
- **Date:** 2026-10-19

## Context

Rubric requires hexagonal layers, explicit ports, and Adapter for the external airport API without leaking infrastructure into domain logic.

## Decision

Each Go service uses:

- `internal/domain` — entities, value objects, ports, domain errors
- `internal/application` — use cases / interactors
- `internal/adapters/in` — HTTP, gRPC, messaging consumers
- `internal/adapters/out` — Postgres, Redis, HTTP clients, publishers

Dependency direction always points inward.

## Consequences

- Pros: testability via mocked ports; Adapter is a first-class out-adapter.
- Cons: more packages/boilerplate early on; discipline required in PRs.
