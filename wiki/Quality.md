# Compuertas de calidad

## Tests unitarios

- Go: casos de uso con puertos falsos.
- Next.js: tests de mapeo de datos del mapa (sin browser flaky en la capa unitaria).
- CI de PR: `.github/workflows/ci.yml` (≤3 minutos; `-short` omite Testcontainers).

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
