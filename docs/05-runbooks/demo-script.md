# Demo script (rubric evidence)

Use this script for recordings/screenshots. Mark items as you complete implementation levels.

## Level 1

1. Show repo structure + wiki home + ADRs.
2. Open Next.js map with at least one airport marker (Plotly).
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
6. Jaeger trace: Gateway → Itinerary → Airport.
7. E2E Testcontainers run output.

## Level 3

1. Outbox table + relay publishing explanation (double-write slide).
2. gRPC call Itinerary → Airport (grpcurl or trace).
3. GitHub Actions green + Sonar gate.
4. K8s manifests with readiness/liveness.
5. Alert example (CB open or DLQ) and/or Toxiproxy chaos snippet.
6. Pact contract test output.
7. Self-assessment table filled in [`../06-self-assessment.md`](../06-self-assessment.md).
