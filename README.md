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
| **GitHub Wiki** | https://github.com/bue221/proyecto-arquitectura-software-emergente/wiki |
| Agent / contributor guide | [`AGENTS.md`](AGENTS.md) |
| Docs in repo (PR source of truth) | [`docs/README.md`](docs/README.md) |
| Wiki seed pages | [`wiki/`](wiki/) |
| Architecture overview | [`docs/01-architecture/overview.md`](docs/01-architecture/overview.md) |
| Branching & PRs | [`docs/04-devops/branching.md`](docs/04-devops/branching.md) |
| Self-assessment | [`docs/06-self-assessment.md`](docs/06-self-assessment.md) |

## Run locally

```bash
make up      # Docker: Gateway + Redis + Airport + Itinerary + Web
make smoke   # quick API checks
make down
```

| URL | Service |
|-----|---------|
| http://localhost:3000 | Web |
| http://localhost:8080/health | API Gateway |
| http://localhost:8081/swagger | Airport |
| http://localhost:8081/api/v1/resilience | Airport CB / cache |

## Repository status

Level 1 + Gateway + Airport Redis/circuit-breaker are in place. Remaining Level 2/3 (RabbitMQ notify, Jaeger, Testcontainers) lands via PRs.

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
