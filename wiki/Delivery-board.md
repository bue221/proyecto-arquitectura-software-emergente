# Tablero de entrega (GitHub Project)

Tablero oficial en **español**: GitHub Project (no Trello/Jira).

## URL

https://github.com/users/bue221/projects/3

Título: **RutaCO — Entrega (Fase 0 → N3)**

## Columnas (Estado)

| Estado | Significado |
|--------|-------------|
| **Hecho** | Ya está en `main` (Fase 0 → Nivel 3) |
| **En progreso** | Cierre de entrega (Sonar, demo, CD, wiki) |
| **Por hacer** | Extras opcionales (OpenFaaS, k6) |

> El nombre técnico del campo en la API sigue siendo `Status`; las opciones visibles del kanban están en español.

## Campo Fase

| Fase | Contenido |
|------|-----------|
| Fase 0 | Docs, ADRs, diagramas, wiki |
| Nivel 1 | Adapter, hexagonal, CRUD, Compose, Studio |
| Nivel 2 | Redis, CB, Gateway, eventos, OTel, E2E |
| Nivel 3 | Outbox, gRPC, mTLS, K8s, Pact, CI |
| Entrega | Sonar, evidencia de demo, CD GHCR, wiki |

## Instantánea

### Hecho
- **F0** `#38`–`#44` · **N1** `#45`–`#52` · **N2** `#53`–`#58` · **N3** `#59`–`#69` · checklist `#31`

### En progreso
| Issue | Tema |
|-------|------|
| [#32](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/32) | SonarCloud + `SONAR_TOKEN` |
| [#33](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/33) | Evidencia del guion de demo |
| [#34](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/34) | Verificar CD en GHCR |
| [#70](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/70) | Fusionar workflow Sonar (PR #37) |
| [#71](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/71) | Fusionar workflow CD (PR #37) |
| [#72](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/72) | Publicar wiki tras merge |

### Por hacer (opcional)
| Issue | Tema |
|-------|------|
| [#35](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/35) | OpenFaaS |
| [#36](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/36) | Load tests k6/vegeta |

## Tips de vista

1. Vista **Board** agrupada por **Status** (Hecho / En progreso / Por hacer).
2. Filtro o agrupación por **Fase**.
3. Issues: https://github.com/bue221/proyecto-arquitectura-software-emergente/issues?q=label%3Adelivery
