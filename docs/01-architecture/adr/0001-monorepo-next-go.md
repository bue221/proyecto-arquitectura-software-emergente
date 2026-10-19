# ADR-0001: Monorepo with Next.js frontend and Go backends

- **Status:** Accepted
- **Date:** 2026-10-19

## Context

The course requires multiple deployable units, rich documentation, and a full DevOps cycle. We need one repository for wiki, contracts, services, and CI, with a UI for Plotly maps and efficient backends.

## Decision

- Single **monorepo**.
- **Next.js** for `apps/web`.
- **Go** for Gateway, Airport Service, Itinerary Service, and FaaS workers/handlers where applicable.

## Consequences

- Pros: atomic PRs across docs+code; shared contracts; Go fits CPU/memory goals.
- Cons: polyglot CI; need clear module boundaries so the monorepo does not become a distributed monolith.
