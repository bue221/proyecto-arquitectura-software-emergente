# CI/CD plan

## Why

Level 3 and the DevOps rubric require continuous integration and an example of continuous delivery, plus quality gates (tests, SonarQube/SonarCloud).

## Current

| Workflow | Trigger | Purpose | Budget |
|----------|---------|---------|--------|
| [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) | PR + push `main` | Go unit tests + Vitest (`web-tests`) + **Docker build** (no push) | tests ≤3 min; docker ≤12 min |
| [`.github/workflows/e2e-nightly.yml`](../../.github/workflows/e2e-nightly.yml) | nightly / `main` path / dispatch | Testcontainers Postgres E2E | 10 min |
| [`.github/workflows/sonar.yml`](../../.github/workflows/sonar.yml) | PR + push `main` / dispatch | Coverage + **SonarCloud** quality gate (skips scan if `SONAR_TOKEN` missing) | 15 min |
| [`.github/workflows/cd-example.yml`](../../.github/workflows/cd-example.yml) | push `main` / tags `v*` / dispatch | Build & push images (Go + **web**) to **GHCR** + image pointer artifact | ≤12 min |

```mermaid
flowchart LR
  PR[Pull Request] --> U[Unit tests ci.yml]
  PR --> D[docker-build no push]
  U --> S[SonarCloud sonar.yml]
  main[Push main] --> U
  main --> S
  main --> E2E[e2e-nightly]
  main --> CD[cd-example GHCR]
  CD --> ART[Artifact cd-example-images.env]
  ART --> K8S[Optional kubectl apply infra/k8s]
```

## Minimal CD (what it does / does not)

**Does**

- Buildx builds for `airport-service`, `itinerary-service`, `api-gateway`, `notification-function`, and `web`.
- Pushes to `ghcr.io/<owner>/rutaco-<service>` with `latest` (on `main`), branch, semver, and `sha-<short>` tags.
- Uploads `infra/k8s/cd-example-images.env` as a workflow artifact listing the SHA tags (includes `WEB_IMAGE`) for a local/staging apply.
- Reuses GHA BuildKit cache (`cache-from` / `cache-to`) per image scope.

**Does not**

- Require a live Kubernetes cluster in GitHub Actions (no kubeconfig secret by default).
- Mutate production. Operators apply `infra/k8s/` after `docker login ghcr.io` using the artifact tags.

## Docker build speed

Dockerfiles use:

- Layered `go.mod` / `go.sum` (and `packages/proto` for airport/itinerary) before source copy
- BuildKit cache mounts for Go modules / compile cache and npm
- Next.js `output: "standalone"` so the web image does not ship full `node_modules`

Local tip: keep BuildKit on (`DOCKER_BUILDKIT=1`, default on modern Docker Desktop).

## SonarCloud setup (one-time)

1. Create a project at [sonarcloud.io](https://sonarcloud.io) for this GitHub repo (org/user key must match `sonar.organization` in `sonar-project.properties`).
2. Generate a token and add GitHub Actions secret **`SONAR_TOKEN`**.
3. Confirm `sonar.projectKey` / `sonar.organization` in `sonar-project.properties` match the SonarCloud UI.
4. Re-run workflow `sonar` (or open a PR). Quality gate waits (`sonar.qualitygate.wait=true`).

If `SONAR_TOKEN` is unset, coverage steps still run and the Sonar scan step is skipped with a notice (PR stays green).

## Secrets

| Name | Used by | Notes |
|------|---------|-------|
| `SONAR_TOKEN` | `sonar.yml` | Required for SonarCloud scan; optional for green CI |
| `GITHUB_TOKEN` | `cd-example.yml` | Built-in; needs `packages: write` (set on the workflow) |

Never commit tokens. Package visibility for GHCR may need a first manual “public” toggle under GitHub Packages if reviewers pull without auth.

## Environments

| Env | Purpose |
|-----|---------|
| Local Compose | Dev + demo (`make up`) |
| CI ephemeral | PR verification (tests + docker build) |
| GHCR + K8s manifests | CD example with probes (`infra/k8s/`) |
