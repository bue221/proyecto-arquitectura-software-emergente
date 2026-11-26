# Observability — OpenTelemetry + Jaeger (Level 2), Prometheus + Grafana (Level 3)

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

## Metrics — Prometheus + Grafana (Level 3)

| Piece | URL |
|-------|-----|
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3002 — dashboard **RutaCO — Gateway & Resiliencia** (home), anonymous viewer, `admin/admin` to edit |

Scrape targets (`infra/prometheus/prometheus.yml`):

| Job | Endpoint | Interval |
|-----|----------|----------|
| `api-gateway` | `api-gateway:8080/metrics` | 5s |
| `airport-service` | `airport-service:8081/metrics` | 15s |

Gateway metrics (`services/api-gateway/internal/platform/metrics`), RED style:

| Metric | Type | Labels |
|--------|------|--------|
| `gateway_http_requests_total` | counter | `route`, `method`, `code` |
| `gateway_http_request_duration_seconds` | histogram | `route`, `method` |
| `gateway_http_requests_in_flight` | gauge | — |

- The middleware wraps the whole edge chain, so **401** (JWT) and **429** (rate limit) rejections are counted.
- `route` is the ServeMux **pattern** (`/api/v1/itineraries/{id}`), never the raw path, so label cardinality stays bounded; unmatched paths use `route="unmatched"`.
- `/metrics` on the gateway is unauthenticated (local/demo). In a real deployment restrict it to the cluster network.

Airport metrics: `airport_circuit_breaker_open`, `airport_bulkhead_rejected_total`, `airport_upstream_calls_total{result}` (alerts in `infra/prometheus/alerts.yml`).

Grafana is provisioned as code: datasource `infra/grafana/provisioning/datasources/`, dashboard JSON `infra/grafana/dashboards/rutaco-overview.json` (read-only in the UI; edit the JSON and restart `grafana`).

### Metrics demo

1. `make up`, open Grafana http://localhost:3002.
2. `make load` — watch Requests/s, p95 and the **429 %** panel rise (rate limiter at work).
3. `curl localhost:8080/api/v1/demo/fail` — 5xx panel moves.
4. Circuit breaker: point Airport at an unreachable Colombia URL (both `COLOMBIA_API_BASE_URL` and the mounted `airport.json`), `redis-cli FLUSHALL`, keep hitting `/api/v1/airports` → CB stat turns **ABIERTO** and Prometheus alert `AirportCircuitBreakerOpen` fires after ~1 min.

Useful PromQL:

```promql
sum by (code) (rate(gateway_http_requests_total[1m]))
histogram_quantile(0.95, sum by (le, route) (rate(gateway_http_request_duration_seconds_bucket[1m])))
sum(rate(gateway_http_requests_total{code="429"}[1m])) / sum(rate(gateway_http_requests_total[1m]))
```
