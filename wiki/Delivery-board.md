# Tablero de entrega (GitHub Issues)

Trello / Jira son opcionales. Este repo lleva el trabajo de entrega con **Issues de GitHub** y etiquetas, sin depender de un MCP de Trello.

## URL del tablero

https://github.com/bue221/proyecto-arquitectura-software-emergente/issues

Filtros útiles:

- Abierto: `is:issue is:open label:delivery`
- Cerrado: `is:issue is:closed label:delivery`
- Nivel 3: `is:issue is:open label:level-3`

## Etiquetas

| Etiqueta | Significado |
|----------|-------------|
| `delivery` | Paquete de entrega del curso |
| `level-1` / `level-2` / `level-3` | Banda de rúbrica |
| `devops` | CI/CD, Sonar, imágenes |
| `demo` | Guion de demo / evidencia |
| `done-in-main` | Ya fusionado en `main` (histórico cerrado) |

## Instantánea

| Ítem | Estado | Notas |
|------|--------|-------|
| Checklist arquitectura N1–N3 | Hecho | [Self-assessment](Self-assessment) |
| Guion de demo + evidencia HTTP | En curso | `make demo-evidence` + capturas manuales |
| SonarCloud en CI | En curso | Requiere secret `SONAR_TOKEN` |
| CD mínimo (GHCR) | En curso | Workflow `cd-example.yml` |
| Empaquetado OpenFaaS | Opcional | Solo si el curso lo exige |
| Load tests (k6) | Opcional | Ver [Quality](Quality) |

## Nota para agentes

No hay MCP de Trello en este workspace de Cursor. Preferir Issues aquí (o Linear si el equipo añade ese MCP). No inventar un segundo tablero de verdad.

## Issues enlazados

| Issue | Tema |
|-------|------|
| [#31](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/31) | Checklist N1–N3 (cerrado / hecho) |
| [#32](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/32) | SonarCloud + `SONAR_TOKEN` |
| [#33](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/33) | Pack de evidencia de demo |
| [#34](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/34) | Verificar CD en GHCR |
| [#35](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/35) | OpenFaaS opcional |
| [#36](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/36) | Load tests opcionales |

