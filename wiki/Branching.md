# Política de ramas y Pull Requests

## Por qué

La rúbrica pide ramas estándar, Pull Requests y un ciclo DevOps visible (planear → codear → revisar → integrar). También impide que los agentes de IA commiteen directo a `main`.

## Regla dura (también en `AGENTS.md`)

```text
every change → branch → PR → merge into main
```

No hay excepción para docs, chores ni trabajo de agentes. Un commit local en `main` no es una entrega válida.

## Rama por defecto

- `main` — documentación y código siempre publicables; **protegida**; el merge **solo vía PR**.

Más adelante, opcional: `develop` para integración si el equipo crece. Hasta entonces, las ramas de feature se fusionan a `main`.

## Nombres de rama

| Prefijo | Uso |
|---------|-----|
| `feat/<scope>-<slug>` | Comportamiento nuevo |
| `fix/<scope>-<slug>` | Corrección |
| `docs/<slug>` | Solo wiki / ADR |
| `chore/<slug>` | Tooling, CI, dependencias |
| `refactor/<scope>-<slug>` | Sin cambio de comportamiento |
| `test/<scope>-<slug>` | Solo tests |

Scopes: `airport`, `itinerary`, `gateway`, `notify`, `web`, `infra`, `docs`.

Ejemplos:

- `feat/airport-colombia-adapter`
- `docs/outbox-diagram`
- `chore/github-actions-ci`

## Commits

Conventional Commits, en **inglés**:

```text
feat(itinerary): add create use case with outbox write
fix(airport): treat upstream 429 as retryable
docs(adr): accept rabbitmq broker decision
```

## Reglas del PR

1. Una unidad de trabajo por PR (revisable).
2. Completar la [plantilla de PR](https://github.com/bue221/proyecto-arquitectura-software-emergente/blob/main/.github/PULL_REQUEST_TEMPLATE.md).
3. Actualizar `docs/` **y** las páginas `wiki/` correspondientes en el **mismo** PR cuando cambien arquitectura, comportamiento, UI u ops. La prosa de `wiki/` va en español; los nombres de archivo no se traducen.
4. Tras el merge: publicar la wiki con `make wiki` (ver `AGENTS.md` — sincronización obligatoria).
5. Enlazar el issue de backlog/Jira cuando exista.
6. Squash o merge según prefiera el equipo; el historial debe poder leerse.
7. No fusionar con checks obligatorios en rojo cuando CI exista.

## Regla para agentes

Los agentes deben **proponer** el nombre de rama y el resumen del PR; nunca asumir que un commit directo a `main` es aceptable.  
Deben actualizar `wiki/` en el PR (en español) y ejecutar `make wiki` después del merge si cambió el contenido de la wiki.
