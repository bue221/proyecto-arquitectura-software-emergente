# Observabilidad — OpenTelemetry + Jaeger (Nivel 2), Prometheus + Grafana (Nivel 3)

## Stack

| Pieza | URL / entorno |
|-------|----------------|
| UI de Jaeger | http://localhost:16686 |
| OTLP HTTP | `jaeger:4318` (Compose) |
| Entorno | `OTEL_EXPORTER_OTLP_ENDPOINT=jaeger:4318` en Gateway, Airport e Itinerary |

Las trazas usan W3C Trace Context. Los logs siguen exponiendo `X-Trace-Id` / `trace_id` (alineado al trace id de OTel cuando hay un span activo).

## Demo del camino feliz

1. `make up`
2. Crear un itinerario vía Gateway (JWT), o pegarle a `GET /api/v1/airports/1` por `:8080`.
3. Abrir Jaeger → servicio `api-gateway` → encontrar la traza que cruza Gateway → (Itinerary) → Airport.

## Demo de fallo controlado

```bash
curl -sI http://localhost:8080/api/v1/demo/fail
# se espera HTTP/1.1 503
```

En Jaeger, buscar el servicio `airport-service` (o `api-gateway`) y la operación `demo.controlled_failure`: el estado del span es **Error**.

## Relacionado

- Guion de demo: [Demo-script](Demo-script)
- Autoevaluación: [Self-assessment](Self-assessment)

## Métricas — Prometheus + Grafana (Nivel 3)

| Pieza | URL |
|-------|-----|
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3002 — dashboard **RutaCO — Gateway & Resiliencia** (página de inicio), lectura anónima, `admin/admin` para editar |

Targets que scrapea Prometheus (`infra/prometheus/prometheus.yml`):

| Job | Endpoint | Intervalo |
|-----|----------|-----------|
| `api-gateway` | `api-gateway:8080/metrics` | 5s |
| `airport-service` | `airport-service:8081/metrics` | 15s |

Métricas del Gateway (`services/api-gateway/internal/platform/metrics`), estilo RED (tasa, errores, duración):

| Métrica | Tipo | Labels |
|---------|------|--------|
| `gateway_http_requests_total` | counter | `route`, `method`, `code` |
| `gateway_http_request_duration_seconds` | histogram | `route`, `method` |
| `gateway_http_requests_in_flight` | gauge | — |

- El middleware envuelve toda la cadena del borde, así que también cuenta los rechazos **401** (JWT) y **429** (rate limit).
- `route` es el **patrón** del ServeMux (`/api/v1/itineraries/{id}`), nunca el path crudo, para que la cardinalidad de labels quede acotada; los paths sin ruta usan `route="unmatched"`.
- `/metrics` del Gateway no tiene autenticación (entorno local/demo). En un despliegue real debe restringirse a la red interna del clúster.

Métricas de Airport: `airport_circuit_breaker_open`, `airport_bulkhead_rejected_total`, `airport_upstream_calls_total{result}` (alertas en `infra/prometheus/alerts.yml`).

Grafana se provisiona como código: datasource en `infra/grafana/provisioning/datasources/` y dashboard JSON en `infra/grafana/dashboards/rutaco-overview.json` (solo lectura en la UI; se edita el JSON y se reinicia `grafana`).

### Demo de métricas

1. `make up` y abrir Grafana en http://localhost:3002.
2. `make load`: subir Requests/s, p95 y el panel de **% 429** (el rate limiter actuando).
3. `curl localhost:8080/api/v1/demo/fail`: se mueve el panel de 5xx.
4. Circuit breaker: apuntar Airport a una URL de Colombia inalcanzable (tanto `COLOMBIA_API_BASE_URL` como el `airport.json` montado), `redis-cli FLUSHALL` y seguir llamando `/api/v1/airports`: el stat del CB pasa a **ABIERTO** y la alerta `AirportCircuitBreakerOpen` de Prometheus se dispara en ~1 min.

PromQL útil:

```promql
sum by (code) (rate(gateway_http_requests_total[1m]))
histogram_quantile(0.95, sum by (le, route) (rate(gateway_http_request_duration_seconds_bucket[1m])))
sum(rate(gateway_http_requests_total{code="429"}[1m])) / sum(rate(gateway_http_requests_total[1m]))
```
