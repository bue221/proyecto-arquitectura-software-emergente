> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Pull Request checklist

Copy into the PR if the template is outdated.

## Design

- [ ] Matches hexagonal boundaries (no infra imports in `domain`)
- [ ] No business logic added to Gateway
- [ ] Frontend does not call API Colombia
- [ ] New/changed public behavior documented under `docs/`

## Quality

- [ ] Unit tests for changed use cases / ports
- [ ] Error paths return consistent HTTP problem shape
- [ ] Logs are JSON and include trace correlation when in request path
- [ ] Migrations included if schema changed (per service)

## Level awareness

- [ ] If touching events: AsyncAPI updated; outbox not bypassed
- [ ] If touching external I/O: timeouts + retry/CB considered
- [ ] If Level 3 surface: probes / contracts / CI notes updated

## Ops

- [ ] Secrets not committed
- [ ] Compose/K8s changes described in PR body
- [ ] Demo impact noted for reviewers (`docs/05-runbooks/demo-script.md`)
