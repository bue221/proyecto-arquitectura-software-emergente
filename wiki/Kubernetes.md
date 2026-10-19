# Kubernetes (Nivel 3)

Manifiestos en `infra/k8s/` para demos locales o Kind:

| Archivo | Propósito |
|---------|-----------|
| `namespace.yaml` | namespace `rutaco` |
| `airport-service.yaml` | Deployment + Service; probes `/ready` y `/live` |
| `itinerary-service.yaml` | Deployment + Service; probes `/ready` y `/live` |
| `api-gateway.yaml` | Deployment + Service de borde; probes `/ready` y `/live` |

Aplicar (después de construir imágenes etiquetadas `rutaco/*:local`):

```bash
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/
kubectl -n rutaco get pods
```

Las probes usan HTTP GET en los mismos puertos que Compose. Las dependencias de apoyo (Postgres, Redis, RabbitMQ) siguen primero en Compose para la demo académica; conéctalas vía Secrets/ConfigMaps cuando el destino sea un clúster completo.
