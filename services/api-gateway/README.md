# api-gateway

Edge entrypoint for the Personal Itineraries Platform.

## Responsibilities (only)

- Reverse-proxy `/api/v1/airports*` → Airport Service
- Reverse-proxy `/api/v1/itineraries*` → Itinerary Service
- Rate limiting (per client IP)
- JWT validation on itinerary routes + propagation of `Authorization`, `X-Trace-Id`, `X-User-Sub`, `X-User-Role`
- Demo token issuer: `POST /auth/token`

## Non-responsibilities

No itinerary validation, airport adapter logic, persistence, or notifications.

## Run

```bash
export AIRPORT_SERVICE_URL=http://localhost:8081
export ITINERARY_SERVICE_URL=http://localhost:8082
export JWT_SIGNING_KEY=dev-only-change-me
go test ./...
go run ./cmd/server
```

- Health: http://localhost:8080/health
- Issue token:
  ```bash
  curl -sS -X POST http://localhost:8080/auth/token \
    -H 'Content-Type: application/json' \
    -d '{"subject":"ana","role":"traveler"}'
  ```

## Docs

ADR-0007 — Gateway without business logic.
