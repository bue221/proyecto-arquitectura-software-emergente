# ADR-0008: URI API versioning and list pagination

- **Status:** Accepted
- **Date:** 2026-10-19

## Context

Level 3 requires explicit API versioning and pagination for list endpoints so clients can evolve without unbounded payloads.

## Decision

1. **Versioning:** public HTTP APIs live under `/api/v1/...`. Every successful response sets header `API-Version: 1`. Breaking changes require `/api/v2` (new routes), not silent field renames in v1.
2. **Pagination:** `GET /api/v1/itineraries` uses offset pagination:
   - Query: `page` (default 1), `pageSize` (default 20, max 100)
   - Body: `items`, `count`, `page`, `pageSize`, `total`, `totalPages`
3. Airport map list stays unpaged (bounded Colombia catalog); versioning header still applies.

## Consequences

- Web clients that ignore pagination fields keep working (`items` preserved).
- Gateway continues path-prefix proxy; no business logic for paging.
