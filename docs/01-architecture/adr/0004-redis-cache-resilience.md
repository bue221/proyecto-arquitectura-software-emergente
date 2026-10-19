# ADR-0004: Redis for airport cache and resilience support

- **Status:** Accepted
- **Date:** 2026-10-19

## Context

API Colombia is an external dependency. Repeated map loads must not hammer it; Level 2 requires cache plus circuit breaker evidence.

## Decision

Airport Service uses **Redis** as cache-aside for adapted airport payloads, with TTL and explicit invalidation strategy documented in the service page. Circuit breaker state may be process-local; Redis is not the source of truth for itineraries.

## Consequences

- Pros: lower latency; fewer external calls; demoable resilience.
- Cons: possible stale catalog until TTL; need clear fallback when Redis is down.
