# Delivery board (GitHub Issues)

Trello / Jira are optional. This repo tracks delivery work with **GitHub Issues** + labels so agents and humans share one board without extra MCP credentials.

## Board URL

https://github.com/bue221/proyecto-arquitectura-software-emergente/issues

Filter examples:

- Open delivery work: `is:issue is:open label:delivery`
- Done: `is:issue is:closed label:delivery`
- Level 3 polish: `is:issue is:open label:level-3`

## Labels

| Label | Meaning |
|-------|---------|
| `delivery` | Part of the course delivery pack |
| `level-1` / `level-2` / `level-3` | Rubric band |
| `devops` | CI/CD, Sonar, images |
| `demo` | Demo script / evidence |
| `done-in-main` | Already merged on `main` (closed for history) |

## Snapshot (this PR)

| Item | Status | Notes |
|------|--------|-------|
| Levels 1–3 architecture checklist | Done | `docs/06-self-assessment.md` |
| Demo script + automated evidence | In progress | `scripts/demo-evidence.sh` + manual screenshots |
| SonarCloud in CI | In progress | `.github/workflows/sonar.yml` (needs `SONAR_TOKEN`) |
| Minimal CD (GHCR) | In progress | `.github/workflows/cd-example.yml` |
| OpenFaaS packaging | Optional | Only if course insists beyond Compose FaaS worker |
| Load tests (k6) | Optional | See `docs/04-devops/quality.md` |

## Agent note

No Trello MCP is available in this Cursor workspace. Prefer Issues here (or Linear if the team adds that MCP later). Do not invent a second board of record.

## Linked issues

| Issue | Topic |
|-------|-------|
| [#31](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/31) | Levels 1–3 checklist (closed / done) |
| [#32](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/32) | SonarCloud + `SONAR_TOKEN` |
| [#33](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/33) | Demo evidence pack |
| [#34](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/34) | Verify GHCR CD |
| [#35](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/35) | Optional OpenFaaS |
| [#36](https://github.com/bue221/proyecto-arquitectura-software-emergente/issues/36) | Optional load tests |

