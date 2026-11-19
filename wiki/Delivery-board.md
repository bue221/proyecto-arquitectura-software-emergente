# Tablero de entrega (GitHub Project)

Tablero oficial: **GitHub Project** (no Trello/Jira).

## URL del proyecto

https://github.com/users/bue221/projects/3

Título: **RutaCO — Delivery (P0→L3)**

Columnas (Status):

| Status | Significado |
|--------|-------------|
| Done | Entregado en `main` (Fase 0 → Nivel 3) |
| In Progress | Cierre de entrega en curso (Sonar, demo, CD, wiki) |
| Todo | Extras opcionales (OpenFaaS, k6) |

Vista de Issues: https://github.com/bue221/proyecto-arquitectura-software-emergente/issues?q=label%3Adelivery

## Etiquetas

| Etiqueta | Significado |
|----------|-------------|
| `delivery` | Paquete de entrega del curso |
| `phase-0` | Docs / ADRs / wiki |
| `level-1` / `level-2` / `level-3` | Banda de rúbrica |
| `devops` | CI/CD, Sonar, imágenes |
| `demo` | Guion de demo / evidencia |
| `status-done` / `status-todo` | Filtro grueso |
| `done-in-main` | Trabajo histórico ya en `main` |

## Instantánea

### Hecho (cerrado + Project Done)

- **P0** `#38`–`#44` — visión, arquitectura, BCs, ADRs, diagramas, ramas/wiki, autoevaluación
- **L1** `#45`–`#52` — Adapter, hexagonal, CRUD, Postgres, Swagger, logs, Studio Leaflet, Compose
- **L2** `#53`–`#58` — CB/retry, Redis, Gateway JWT, RabbitMQ/notify, OTel/Jaeger, Testcontainers
- **L3** `#59`–`#69` — Outbox, gRPC, mTLS, Vault, Toxiproxy, bulkhead, Prometheus, K8s, Pact, versionado, CI
- `#31` — checklist agregada Niveles 1–3

### En progreso

| Issue | Tema |
|-------|------|
| [#32](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/32) | SonarCloud + `SONAR_TOKEN` |
| [#33](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/33) | Pack de evidencia de demo |
| [#34](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/34) | Verificar CD en GHCR |
| [#70](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/70) | Fusionar workflow Sonar (PR #37) |
| [#71](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/71) | Fusionar workflow CD (PR #37) |
| [#72](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/72) | `make wiki` tras el PR de devops |

### Todo (opcional)

| Issue | Tema |
|-------|------|
| [#35](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/35) | Empaquetado OpenFaaS |
| [#36](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/36) | Load tests k6/vegeta |

## Nota para agentes

Preferir este Project + Issues. No inventar un segundo tablero de verdad.
