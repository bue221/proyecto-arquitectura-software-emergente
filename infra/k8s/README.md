# Kubernetes (Level 3)

Manifests under `infra/k8s/` for local/Kind demos:

| File | Purpose |
|------|---------|
| `namespace.yaml` | `rutaco` namespace |
| `airport-service.yaml` | Deployment + Service; probes `/ready` `/live` |
| `itinerary-service.yaml` | Deployment + Service; probes `/ready` `/live` |
| `api-gateway.yaml` | Edge Deployment + Service; probes `/ready` `/live` |

Apply (after building images tagged `rutaco/*:local`):

```bash
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/
kubectl -n rutaco get pods
```

Probes use HTTP GET on the same ports as Compose. Supporting deps (Postgres, Redis, RabbitMQ) remain Compose-first for the academic demo; wire them via Secrets/ConfigMaps when targeting a full cluster.
