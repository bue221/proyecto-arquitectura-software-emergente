> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Airport Service

**Status:** implemented (Level 1 + Redis/CB) — `services/airport-service` on port `8081`, Swagger at `/swagger`.

## Why

Owns the **Airport Catalog** bounded context. Isolates API Colombia behind an Adapter so the rest of the system (and Next.js) never depends on the external schema.

## Responsibilities

- Fetch airports from API Colombia.
- Map external DTO → domain `Airport` → API/Plotly DTO.
- Cache adapted responses in Redis.
- Expose REST (later gRPC) for get-by-id / list-for-map.
- Resilience: timeout, retry+backoff+jitter, circuit breaker.

## Non-responsibilities

- Itinerary CRUD
- Sending notifications
- JWT issuance (Gateway concern)

## Hexagonal sketch

| Layer | Contents |
|-------|----------|
| Domain | `Airport`, `AirportProvider` port, errors |
| Application | `GetAirport`, `ListAirportsForMap` |
| Adapters in | HTTP handlers, OpenAPI, gRPC server (L3) |
| Adapters out | Colombia HTTP adapter, Redis cache (memory fallback), circuit breaker + retry |

## Resilience

- **Cache-aside:** Redis when `REDIS_ADDR` is set; falls back to in-process memory if Redis is unreachable.
- **Timeout / retry / CB:** see Compose env `UPSTREAM_TIMEOUT_MS`, `CB_*`.
- **Inspect:** `GET /api/v1/resilience`.

## Error strategy

| Condition | HTTP | Notes |
|-----------|------|-------|
| Not found | 404 | Stable error code `airport_not_found` |
| Upstream timeout/open CB | 503 | `upstream_unavailable`; log + metrics |
| Validation | 400 | Bad path/query params |
| Internal | 500 | Sanitized message; full detail in logs |

## Observability

JSON logs with `trace_id`/`span_id`; spans around external call and cache hit/miss; Prometheus metrics for CB state and cache hit ratio.

## Related diagrams

- [`../03-diagrams/adapter.md`](../03-diagrams/adapter.md)
- [`../03-diagrams/sequences.md`](../03-diagrams/sequences.md)
