# Compuertas de calidad

## Tests unitarios

- Go: casos de uso con puertos falsos.
  - Airport: application, adaptador Colombia, resiliencia (CB/bulkhead), cache en memoria, gRPC/TLS, proveedor Pact.
  - Itinerary: create + outbox relay, normalización de packing/planes, paginación, consumidor Pact.
  - Gateway: JWT issue/parse + middleware (rate limit, RequireJWT, CORS, trace).
  - Notification FaaS: caso de uso de envío.
- Next.js (`apps/web`): Vitest (Node) para:
  - puerto/registry/preferencias de tiles y adaptador Mapbox
  - geo de ruta curva + merge/duración de aeropuertos del Studio
  - recomendaciones/estilos de tarjetas
  - parseo de errores en `lib/api/http`
  - sesión JWT, cliente de auth demo, APIs de itinerarios/aeropuertos (401 → sesión expirada)
  - Local: `cd apps/web && npm test`
  - Job CI: `web-tests` en `.github/workflows/ci.yml`
- CI de PR: `.github/workflows/ci.yml` (jobs unitarios ≤3 minutos; `-short` omite Testcontainers; `docker-build` en paralelo).

## Integración / E2E

- Postgres de Itinerary vía Testcontainers: `services/itinerary-service/internal/adapters/out/postgres/repository_integration_test.go`.
- Se omite en CI de PR con `go test -short`; corrida completa en `.github/workflows/e2e-nightly.yml`.

## SonarCloud

- Workflow: `.github/workflows/sonar.yml` (`sonarqube-scan-action@v6`)
- Config: `sonar-project.properties` en la raíz
- Genera `coverage.out` por módulo Go y espera la quality gate cuando existe `SONAR_TOKEN`
- Si falta el secret, la cobertura corre y el scan se omite (solo aviso)
- Secret: `SONAR_TOKEN` (ver [CI-CD](CI-CD))

## Pruebas de carga

- Herramienta: **k6** ejecutado con Docker (`grafana/k6:0.54.0`), sin instalación local. Script: `tests/load/gateway-load.js`.
- Con el stack arriba: `make load` (~80 s). Para otro destino: `make load LOAD_BASE=http://host:8080`.
- Escenarios:
  - `airports_read` — rampa de 0 a 30 VUs sobre `GET /api/v1/airports` (camino con caché Redis).
  - `itineraries_write` — 5 VUs sobre `POST /api/v1/itineraries` con JWT de demo (validación gRPC + Outbox).
- Umbrales: `p(95) < 500ms` en lecturas de aeropuertos, `checks > 80%`.
- **Cómo leer el resultado:** `http_req_failed` sale alto a propósito — k6 dispara desde una sola IP, así que la mayoría de las peticiones extra reciben **429** del rate limiter del Gateway (`RATE_LIMIT_RPS=20`, `RATE_LIMIT_BURST=40`). Los checks aceptan `429` como comportamiento correcto. Corrida de referencia (local, Docker Desktop): ~76 req/s, p95 ≈ 5 ms.
- Objetivo: evidencia para la rúbrica, no SLOs de producción.

## Contratos (Nivel 3)

- Pact: `packages/contracts/pact/Airport-Itinerary.json` + tests consumer/provider.

## Swagger / OpenAPI

- UI OpenAPI por servicio Go; copias en `packages/contracts/openapi/`.

## Caos / Toxiproxy

- Compose `toxiproxy`; runbook en `infra/toxiproxy/README.md`.
- Capturar métricas de CB abierto + alertas Prometheus en la evidencia de demo.

## Alertas Prometheus

- `infra/prometheus/alerts.yml` — `AirportCircuitBreakerOpen`, `AirportBulkheadSaturated`.
- UI local `:9090`; Prometheus scrapea `/metrics` de Airport y del Gateway. Dashboard de Grafana en `:3002` (ver [Observability](Observability)).
