# Observability — OpenTelemetry + Jaeger (Level 2)

## Stack

| Piece | URL / env |
|-------|-----------|
| Jaeger UI | http://localhost:16686 |
| OTLP HTTP | `jaeger:4318` (Compose) |
| Env | `OTEL_EXPORTER_OTLP_ENDPOINT=jaeger:4318` on Gateway, Airport, Itinerary |

Traces use W3C Trace Context. Logs still expose `X-Trace-Id` / `trace_id` (aligned with the OTel trace id when a span is active).

## Happy-path demo

1. `make up`
2. Create an itinerary via Gateway (JWT) — or hit `GET /api/v1/airports/1` through `:8080`.
3. Open Jaeger → service `api-gateway` → find the trace spanning Gateway → (Itinerary) → Airport.

## Controlled failure demo

```bash
curl -sI http://localhost:8080/api/v1/demo/fail
# expect HTTP/1.1 503
```

In Jaeger, search service `airport-service` (or `api-gateway`) for operation `demo.controlled_failure` — span status **Error**.

## Related

- Demo script: [`demo-script.md`](demo-script.md)
- Self-assessment: [`../06-self-assessment.md`](../06-self-assessment.md)
