# airport-service

Go hexagonal microservice for the **Airport Catalog** bounded context.

## Architecture

- `internal/domain` — `Airport`, ports, errors
- `internal/application` — use cases
- `internal/adapters/out/colombia` — **Adapter** to API Colombia (anti-corruption; fixes swapped lat/lon)
- `internal/adapters/out/memorycache` — TTL cache (Redis arrives in Level 2)
- `internal/adapters/in/httpapi` — REST + Swagger UI

## Run

```bash
go test ./...
go run ./cmd/server
```

- Health: http://localhost:8081/health
- Map DTO: http://localhost:8081/api/v1/airports
- By id: http://localhost:8081/api/v1/airports/1
- Swagger: http://localhost:8081/swagger

## Env

| Variable | Default |
|----------|---------|
| `HTTP_ADDR` | `:8081` |
| `COLOMBIA_API_BASE_URL` | `https://api-colombia.com` |
| `UPSTREAM_TIMEOUT_MS` | `8000` |
| `CACHE_TTL_MS` | `300000` |

## Docs

[`../../docs/02-services/airport-service.md`](../../docs/02-services/airport-service.md)
