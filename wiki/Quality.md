# Compuertas de calidad

## Tests unitarios

- Go: casos de uso con puertos falsos.
  - Airport: application, adaptador Colombia, resiliencia (CB/bulkhead), cache en memoria, gRPC/TLS, proveedor Pact.
  - Itinerary: create + outbox relay, normalización de packing/planes, paginación, consumidor Pact.
  - Gateway: JWT issue/parse + middleware (rate limit, RequireJWT, CORS, trace).
  - Notification FaaS: caso de uso de envío.
- Next.js (`apps/web`): Vitest para puerto/registry/preferencias de tiles, geo de ruta curva, recomendaciones/estilos de tarjetas y parseo de errores en `lib/api/http` — sin browser flaky en la capa unitaria.
  - Local: `cd apps/web && npm test`
  - Job CI: `web-tests` en `.github/workflows/ci.yml`
- CI de PR: `.github/workflows/ci.yml` (≤3 minutos; `-short` omite Testcontainers).

## Integración / E2E

- Postgres de Itinerary vía Testcontainers: `services/itinerary-service/internal/adapters/out/postgres/repository_integration_test.go`.
- Se omite en CI de PR con `go test -short`; corrida completa en `.github/workflows/e2e-nightly.yml`.

## SonarCloud

- Workflow: `.github/workflows/sonar.yml`
- Config: `sonar-project.properties` en la raíz
- Genera `coverage.out` por módulo Go y espera la quality gate
- Secret: `SONAR_TOKEN` (ver [CI-CD](CI-CD))

## Pruebas de carga

- Candidatos: `k6` o `vegeta` contra crear/listar del Gateway.
- Objetivo: evidencia de rúbrica (no SLOs de producción). Scripts en un PR posterior si el curso lo exige.

## Contratos (Nivel 3)

- Pact: `packages/contracts/pact/Airport-Itinerary.json` + tests consumer/provider.

## Swagger / OpenAPI

- UI OpenAPI por servicio Go; copias en `packages/contracts/openapi/`.

## Caos / Toxiproxy

- Compose `toxiproxy`; runbook en `infra/toxiproxy/README.md`.
- Capturar métricas de CB abierto + alertas Prometheus en la evidencia de demo.

## Alertas Prometheus

- `infra/prometheus/alerts.yml` — `AirportCircuitBreakerOpen`, `AirportBulkheadSaturated`.
- UI local `:9090`.
