# Delivery board (GitHub Project)

Primary board of record: **GitHub Project** (not Trello/Jira).

## Project URL

https://github.com/users/bue221/projects/3

Title: **RutaCO — Delivery (P0→L3)**

Columns (Status):

| Status | Meaning |
|--------|---------|
| Done | Delivered on `main` (Phase 0 → Level 3 checklist) |
| In Progress | Delivery polish in flight (Sonar secret, demo evidence, CD verify, wiki publish) |
| Todo | Optional extras (OpenFaaS, k6) |

Issues view (same items): https://github.com/bue221/proyecto-arquitectura-software-emergente/issues?q=label%3Adelivery

## Labels

| Label | Meaning |
|-------|---------|
| `delivery` | Course delivery pack |
| `phase-0` | Docs / ADRs / wiki seed |
| `level-1` / `level-2` / `level-3` | Rubric band |
| `devops` | CI/CD, Sonar, images |
| `demo` | Demo script / evidence |
| `status-done` / `status-todo` | Coarse filter |
| `done-in-main` | Historical completed work |

## Snapshot

### Done (closed + Project Done)

- **P0** `#38`–`#44` — vision, architecture docs, BCs, ADRs, diagrams, branching/wiki, self-assessment scaffolds
- **L1** `#45`–`#52` — Adapter, hexagonal, CRUD, Postgres/migrations, Swagger/errors, logs, Leaflet Studio, Compose
- **L2** `#53`–`#58` — CB/retry, Redis, Gateway JWT, RabbitMQ/notify, OTel/Jaeger, Testcontainers
- **L3** `#59`–`#69` — Outbox, gRPC, mTLS, Vault, Toxiproxy, bulkhead, Prometheus, K8s, Pact, versioning, CI
- `#31` — aggregate Levels 1–3 checklist

### In Progress

| Issue | Topic |
|-------|-------|
| [#32](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/32) | SonarCloud project + `SONAR_TOKEN` |
| [#33](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/33) | Demo evidence pack |
| [#34](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/34) | Verify GHCR CD |
| [#70](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/70) | Merge Sonar workflow to `main` (PR #37) |
| [#71](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/71) | Merge CD workflow to `main` (PR #37) |
| [#72](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/72) | `make wiki` after devops PR merge |

### Todo (optional)

| Issue | Topic |
|-------|-------|
| [#35](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/35) | OpenFaaS packaging |
| [#36](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/36) | k6/vegeta load tests |

## Agent note

Prefer this Project + Issues. Do not invent a second board of record unless the team adds Linear/Trello MCP later.
