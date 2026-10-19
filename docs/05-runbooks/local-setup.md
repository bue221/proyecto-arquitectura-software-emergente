# Local setup

## Status

Phase 0: documentation only. This runbook will be completed when Compose stacks land.

## Prerequisites (planned)

- Docker + Docker Compose
- Go 1.22+
- Node.js 20+
- `make` (optional wrappers)

## Planned happy path

```bash
# after implementation PRs
git clone <repo>
cp .env.example .env
docker compose -f infra/docker/docker-compose.yml up --build
# web http://localhost:3000
# gateway http://localhost:8080
# swagger per service ports TBD
```

## Smoke checks (planned)

1. Gateway health 200.
2. Airports map endpoint returns adapted DTO.
3. Create itinerary → 201 → notification row appears.
4. Jaeger shows a distributed trace for the create flow.

Until services exist, use the wiki diagrams for walkthroughs.
