# Quality gates

## Unit tests

- Go: table-driven tests for use cases with fake ports.
- Next.js: component/hooks tests for map data mapping (not flaky browser tests in unit layer).

## Load tests

- Tooling candidate: `k6` or `vegeta` against Gateway create/list paths.
- Goal: evidence for rubric (not production SLOs yet). Record scripts under `infra/` or `tests/load/` in a later PR.

## Contract tests (Level 3)

- Pact (or equivalent) between Itinerary (consumer) and Airport (provider).

## Swagger / OpenAPI

- Each Go service serves OpenAPI UI.
- Source-of-truth copies also in `packages/contracts/openapi/`.

## SonarQube

- CI scan on PRs; quality gate must not regress coverage/duplications once baseline is set.

## Chaos / Toxiproxy (Level 3 sample)

- Inject latency/timeouts toward API Colombia mock.
- Capture CB open metrics + Grafana/Prometheus alert screenshots in demo evidence.

## Prometheus alerts (Level 3)

- Config: `infra/prometheus/prometheus.yml` + `alerts.yml`.
- Rules: `AirportCircuitBreakerOpen`, `AirportBulkheadSaturated`.
- Scrape Airport `/metrics` from Compose service `prometheus` (`:9090`).
