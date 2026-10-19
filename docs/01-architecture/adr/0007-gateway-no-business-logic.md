# ADR-0007: API Gateway without business logic

- **Status:** Accepted
- **Date:** 2026-10-19

## Context

The course requires a single entry point with routing, basic rate limiting, and JWT propagation, explicitly without business rules.

## Decision

`api-gateway` (Go and/or Traefik config) only:

- Routes to Airport and Itinerary services
- Applies rate limits
- Validates/propagates JWT to downstream services

All validation of airports, itinerary invariants, outbox, and notifications stay in their services/functions.

## Consequences

- Pros: clear edge; easier horizontal scaling of services.
- Cons: BFF temptation — reject feature creep in gateway PRs.
