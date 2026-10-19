# Personal Itineraries Platform

Monorepo for a distributed **personal travel itineraries** system (academic architecture challenge).

- **Frontend:** Next.js + Plotly.js (airport map)
- **Backend:** Go microservices (hexagonal) + API Gateway
- **Events:** RabbitMQ + Transactional Outbox
- **Serverless:** Notification functions (local FaaS simulation)
- **Target:** Levels 1, 2, and 3 of the course rubric

> Product domain is **itineraries / Colombian airports**. Unrelated to other personal apps.

## Quick links

| Resource | Link |
|----------|------|
| Agent / contributor guide | [`AGENTS.md`](AGENTS.md) |
| Project wiki | [`docs/README.md`](docs/README.md) |
| Architecture overview | [`docs/01-architecture/overview.md`](docs/01-architecture/overview.md) |
| Branching & PRs | [`docs/04-devops/branching.md`](docs/04-devops/branching.md) |
| Self-assessment | [`docs/06-self-assessment.md`](docs/06-self-assessment.md) |

## Repository status

**Phase 0 — Architecture & documentation.** No runnable business services yet. Implementation starts after ADRs and wiki are accepted.

## Planned layout

```text
apps/web/
services/{api-gateway,airport-service,itinerary-service,notification-function}/
packages/{contracts,proto}/
infra/{docker,k8s}/
docs/
```

## Workflow

1. Read `AGENTS.md` and the wiki page for your area.
2. Branch from `main` (`feat|fix|docs|chore/...`).
3. Open a Pull Request; merge only via PR.

## License

Academic / educational use.
