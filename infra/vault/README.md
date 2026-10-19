# Vault / config server (Level 3)

Two supported overlays for Airport Service (env still wins as base; overlays refine):

1. **Config file** — set `CONFIG_FILE=/config/airport.json` (see `infra/config/airport.example.json`).
2. **Vault KV v2** — set `VAULT_ADDR` + `VAULT_TOKEN` (+ optional `VAULT_SECRET_PATH`, default `secret/data/airport`).

## Compose Vault (dev)

```bash
docker compose -f infra/docker/docker-compose.yml up -d vault
export VAULT_ADDR=http://localhost:8200
export VAULT_TOKEN=root
vault kv put secret/airport colombia_api_base_url=https://api-colombia.com
```

Airport container may mount the example JSON via `CONFIG_FILE` without running Vault.
