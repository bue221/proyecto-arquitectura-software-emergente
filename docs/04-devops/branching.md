# Branching & Pull Request policy

## Why

The course rubric requires standard branches, Pull Requests, and a visible DevOps cycle (planning → code → review → integrate). This also keeps AI agents from committing straight to `main`.

## Default branch

- `main` — always releasable documentation/code; **protected**; merge **only via PR**.

Optional later: `develop` for integration if the team grows. Until then, feature branches merge to `main`.

## Branch naming

| Prefix | Use |
|--------|-----|
| `feat/<scope>-<slug>` | New behavior |
| `fix/<scope>-<slug>` | Bug fix |
| `docs/<slug>` | Wiki / ADR only |
| `chore/<slug>` | Tooling, CI, deps |
| `refactor/<scope>-<slug>` | No behavior change |
| `test/<scope>-<slug>` | Tests only |

Scopes: `airport`, `itinerary`, `gateway`, `notify`, `web`, `infra`, `docs`.

Examples:

- `feat/airport-colombia-adapter`
- `docs/outbox-diagram`
- `chore/github-actions-ci`

## Commits

Conventional Commits, **English**:

```text
feat(itinerary): add create use case with outbox write
fix(airport): treat upstream 429 as retryable
docs(adr): accept rabbitmq broker decision
```

## PR rules

1. One work unit per PR (reviewable).
2. Fill [PR template](../../.github/PULL_REQUEST_TEMPLATE.md).
3. Update wiki/ADR in the **same** PR when architecture/behavior changes.
4. Link backlog/Jira issue when available.
5. Squash or merge as team prefers; keep history readable.
6. Do not merge with failing required checks once CI exists.

## Agent rule

Agents must **propose** branch name + PR summary; never assume direct commits to `main` are acceptable.
