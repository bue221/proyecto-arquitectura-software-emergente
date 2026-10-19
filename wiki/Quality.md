# Compuertas de calidad

## Tests unitarios

- Go: tests table-driven de casos de uso con puertos falsos.
- Next.js: tests de componentes/hooks del mapeo de datos del mapa (sin tests de navegador inestables en la capa unitaria).

## Tests de carga

- Candidatos: `k6` o `vegeta` contra las rutas de crear/listar del Gateway.
- Meta: evidencia para la rúbrica (todavía no SLOs de producción). Los scripts van en `infra/` o `tests/load/` en un PR posterior.

## Tests de contrato (Nivel 3)

- Contrato compatible con Pact: `packages/contracts/pact/Airport-Itinerary.json`.
- Consumidor: `services/itinerary-service/.../airporthttp/pact_consumer_test.go`.
- Proveedor: `services/airport-service/.../httpapi/pact_provider_test.go`.

## Swagger / OpenAPI

- Cada servicio Go sirve la UI de OpenAPI.
- Las copias fuente también viven en `packages/contracts/openapi/`.

## SonarQube

- Escaneo de CI en los PRs; la compuerta no debe empeorar cobertura ni duplicación una vez fijada la línea base.

## Caos / Toxiproxy (muestra de Nivel 3)

- Servicio Compose `toxiproxy` (API `:8474`, HTTP tóxico de Airport `:18475`).
- Runbook: `infra/toxiproxy/README.md` — inyectar latencia, observar timeouts/CB.
- Capturar métricas de CB abierto y capturas de la alerta de Prometheus como evidencia de la demo.

## Alertas de Prometheus (Nivel 3)

- Config: `infra/prometheus/prometheus.yml` + `alerts.yml`.
- Reglas: `AirportCircuitBreakerOpen`, `AirportBulkheadSaturated`.
- Scrape de `/metrics` de Airport desde el servicio Compose `prometheus` (`:9090`).
