# Demo script (rubric evidence)

Use this script for recordings/screenshots. Mark items as you complete implementation levels.

## Level 1

1. Show repo structure + wiki home + ADRs.
2. Open Next.js Studio map with at least one airport marker (Leaflet).
3. Create itinerary via UI or HTTP; show Swagger.
4. Show Postgres itinerary row.
5. Show Docker Compose running services + DBs.
6. Show structured log line with `trace_id`.

## Level 2

1. Break / mock API Colombia → circuit breaker opens (metrics/logs).
2. Redis cache hit after warmup.
3. Request through Gateway with JWT; reject without token.
4. Notification appears after create (async).
5. AsyncAPI file walkthrough.
6. Jaeger UI (`:16686`): Gateway → Itinerary → Airport on create; then `GET /api/v1/demo/fail` error span.
7. E2E Testcontainers run output.

## Level 3

1. Outbox table + relay publishing explanation (double-write slide).
2. gRPC call Itinerary → Airport (grpcurl or trace).
3. GitHub Actions green + Sonar gate.
4. K8s manifests with readiness/liveness (`infra/k8s/`, probes `/ready` `/live`).
5. Alert example (Prometheus `:9090`) and/or Toxiproxy latency (`infra/toxiproxy/README.md`).
6. Pact contract test output.
7. Self-assessment table filled in [`../06-self-assessment.md`](../06-self-assessment.md).
