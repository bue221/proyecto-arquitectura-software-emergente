# Vault / servidor de configuración (Nivel 3)

Dos overlays soportados para Airport Service (el entorno sigue ganando como base; los overlays afinan):

1. **Archivo de config** — definir `CONFIG_FILE=/config/airport.json` (ver `infra/config/airport.example.json`).
2. **Vault KV v2** — definir `VAULT_ADDR` + `VAULT_TOKEN` (+ `VAULT_SECRET_PATH` opcional, default `secret/data/airport`).

## Vault en Compose (dev)

```bash
docker compose -f infra/docker/docker-compose.yml up -d vault
export VAULT_ADDR=http://localhost:8200
export VAULT_TOKEN=root
vault kv put secret/airport colombia_api_base_url=https://api-colombia.com
```

El contenedor de Airport puede montar el JSON de ejemplo vía `CONFIG_FILE` sin levantar Vault.
