# Quality gates

## Unit tests

- Go: table-driven tests for use cases with fake ports.
  - Airport: application, Colombia adapter, resilience (CB/bulkhead), memory cache, gRPC/TLS, Pact provider.
  - Itinerary: create + outbox relay, packing/plan normalization, pagination, Pact consumer.
  - Gateway: JWT issue/parse + middleware (rate limit, RequireJWT, CORS, trace).
  - Notification FaaS: send notification use case.
- Next.js (`apps/web`): Vitest (Node) for:
  - map tile port / registry / preferences / Mapbox adapter
  - curved route geo + studio airport merge/duration
  - trip recommendations / card styles
  - `lib/api/http` error parsing
  - session JWT usability, demo auth client, itineraries/airports API clients (401 → session expired)
  - Local: `cd apps/web && npm test`
  - CI job: `web-tests` in `.github/workflows/ci.yml`
- PR CI: `.github/workflows/ci.yml` (unit jobs ≤3 minutes, `-short` skips Testcontainers; `docker-build` in parallel).

## Integration / E2E

- Itinerary Postgres via Testcontainers: `services/itinerary-service/internal/adapters/out/postgres/repository_integration_test.go`.
- Skipped on PR CI with `go test -short`; full run in `.github/workflows/e2e-nightly.yml`.

## SonarCloud

- Workflow: `.github/workflows/sonar.yml` (`sonarqube-scan-action@v6`)
- Config: `sonar-project.properties` at repo root
- Generates Go `coverage.out` per module, then runs SonarCloud with quality gate wait when `SONAR_TOKEN` is set
- If the secret is missing, coverage still runs and the scan is skipped (notice only)
- Secret: `SONAR_TOKEN` (see [`ci-cd.md`](ci-cd.md))

## Load tests

- Tool: **k6** run through Docker (`grafana/k6:0.54.0`), no local install. Script: `tests/load/gateway-load.js`.
- Run with the stack up: `make load` (~80 s). Override target with `make load LOAD_BASE=http://host:8080`.
- Scenarios:
  - `airports_read` — ramping 0→30 VUs on `GET /api/v1/airports` (Redis cache path).
  - `itineraries_write` — 5 VUs on `POST /api/v1/itineraries` with a demo JWT (gRPC validation + Outbox).
- Thresholds: `p(95) < 500ms` on airport reads, `checks > 80%`.
- **Reading the result:** `http_req_failed` is high on purpose — k6 hits from one IP, so most extra requests get **429** from the Gateway rate limiter (`RATE_LIMIT_RPS=20`, `RATE_LIMIT_BURST=40`). Checks accept `429` as correct behavior. Reference run (local, Docker Desktop): ~76 req/s, p95 ≈ 5 ms.
- Goal: rubric evidence, not production SLOs.

## Contract tests (Level 3)

- Pact-compatible contract: `packages/contracts/pact/Airport-Itinerary.json`.
- Consumer: `services/itinerary-service/.../airporthttp/pact_consumer_test.go`.
- Provider: `services/airport-service/.../httpapi/pact_provider_test.go`.

## Swagger / OpenAPI

- Each Go service serves OpenAPI UI.
- Source-of-truth copies also in `packages/contracts/openapi/`.

## Chaos / Toxiproxy (Level 3 sample)

- Compose service `toxiproxy` (API `:8474`, toxic Airport HTTP `:18475`).
- Runbook: `infra/toxiproxy/README.md` — inject latency toxic, observe timeouts/CB.
- Capture CB open metrics + Prometheus alert screenshots in demo evidence.

## Prometheus alerts (Level 3)

- Config: `infra/prometheus/prometheus.yml` + `alerts.yml`.
- Rules: `AirportCircuitBreakerOpen`, `AirportBulkheadSaturated`.
- Scrape Airport and Gateway `/metrics` from Compose service `prometheus` (`:9090`); Grafana dashboard on `:3002` ([`observability.md`](../05-runbooks/observability.md)).
