# Pull Request checklist

Copy into the PR if the template is outdated.

## Design

- [ ] Matches hexagonal boundaries (no infra imports in `domain`)
- [ ] No business logic added to Gateway
- [ ] Frontend does not call API Colombia
- [ ] Map tiles use Adapter port (no hard-coded CDN in interaction code)
- [ ] New/changed public behavior documented under `docs/`

## Wiki (mandatory)

- [ ] Matching `wiki/` page(s) updated in **this same PR**
- [ ] After merge to `main`: run `make wiki` / `./scripts/publish-wiki.sh`

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
