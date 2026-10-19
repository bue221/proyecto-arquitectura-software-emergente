# API Gateway

**Status:** implemented (Level 2 start) — `services/api-gateway` on port `8080`.

## Why

Single edge entry for browsers and external clients. Keeps routing, rate limits, and JWT concerns out of domain services.

## Does

| Concern | Behavior |
|---------|----------|
| Routing | `/api/v1/airports*` → Airport Service; `/api/v1/itineraries*` → Itinerary Service |
| Auth | JWT required for itinerary routes; `POST /auth/token` issues demo tokens |
| Propagation | Forwards `Authorization`, `X-Trace-Id`; sets `X-User-Sub` / `X-User-Role` |
| Rate limit | Token bucket per client IP |
| Health | `GET /health` |

## Does not

- Airport adapter / catalog rules
- Itinerary invariants / outbox
- Notification sending

## Related

- ADR-0007
- Frontend uses `NEXT_PUBLIC_API_GATEWAY_URL` (defaults to `http://localhost:8080`)
