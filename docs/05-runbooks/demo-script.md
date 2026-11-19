# Demo script (rubric evidence)

Use this script for recordings/screenshots. Mark items as you complete them.

## Automated slice

With the stack up (`make up` + `make smoke`):

```bash
chmod +x scripts/demo-evidence.sh
./scripts/demo-evidence.sh
```

Writes JSON/status captures under `docs/05-runbooks/evidence/<UTC-timestamp>/` (gitignored run folders; keep screenshots you care about in the delivery pack).

Makefile: `make demo-evidence`.

## Level 1

1. Show repo structure + wiki home + ADRs.
2. Open Next.js Studio map with at least one airport marker (Leaflet) — `http://localhost:3001`.
3. Create itinerary via UI or HTTP; show Swagger (`:8081` / `:8082`).
4. Show Postgres itinerary row (`localhost:5434`).
5. Show Docker Compose running services + DBs (`make ps`).
6. Show structured log line with `trace_id`.

## Level 2

1. Break / mock API Colombia → circuit breaker opens (metrics/logs) — or Toxiproxy latency.
2. Redis cache hit after warmup.
3. Request through Gateway with JWT; reject without token (`./scripts/demo-evidence.sh` covers HTTP).
4. Notification appears after create (async) — script checks `notification_records`.
5. AsyncAPI file walkthrough (`packages/contracts/asyncapi/`).
6. Jaeger UI (`:16686`): Gateway → Itinerary → Airport on create; then `GET /api/v1/demo/fail` error span.
7. E2E Testcontainers run output (local or Actions `e2e-nightly`).

## Level 3

1. Outbox table + relay publishing explanation (double-write slide / `docs/03-diagrams/outbox.md`).
2. gRPC call Itinerary → Airport (grpcurl or trace).
3. GitHub Actions green: **ci** + **sonar** (SonarCloud gate) + **cd-example** (GHCR images).
4. K8s manifests with readiness/liveness (`infra/k8s/`, probes `/ready` `/live`).
5. Alert example (Prometheus `:9090`) and/or Toxiproxy latency (`infra/toxiproxy/README.md`).
6. Pact contract test output.
7. Self-assessment table filled in [`../06-self-assessment.md`](../06-self-assessment.md).

## Delivery board

Track open vs done items on GitHub Issues — see [`delivery-board.md`](delivery-board.md).
