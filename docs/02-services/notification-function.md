# Notification Function (Serverless)

**Status:** Level 2 implemented — Compose worker `notification-function` on `:8083` (FaaS-style local simulation per ADR-0006).

## Why

Demonstrates the **serverless** architecture axis: work runs when events arrive, without a permanent notification *business* microservice owning itinerary create.

## Functions

| Function | Trigger | Behavior |
|----------|---------|----------|
| `SendNotificationFunction` | `itinerary.created` on RabbitMQ | Simulate email/log; persist `notification_records` |
| `GenerateItineraryReportFunction` (optional) | On-demand HTTP/invoke | Aggregate metrics — pending |

## Runtime (local)

| Piece | Detail |
|-------|--------|
| Container | `services/notification-function` |
| Health | `GET http://localhost:8083/health` |
| Queue | `notification.itinerary-created` bound to exchange `itinerary.events` / key `itinerary.created` |
| DB | `notification-db` Postgres host port `5435` (one DB per service) |

OpenFaaS packaging can wrap the same application handler later; the domain use case stays unchanged.

## Data

`notification_records (id, event_id UNIQUE, itinerary_id, channel, status, payload, created_at)`.

## Error strategy

- At-least-once delivery → **idempotent** handlers (dedupe by `event_id`).
- Handler failure → Nack + requeue; poison / DLQ later (L3).
- User-facing errors are **not** returned on the sync create itinerary path.

## Related

- ADR-0006, ADR-0003
- AsyncAPI: `packages/contracts/asyncapi/itinerary-events.yaml`
- [`../03-diagrams/outbox.md`](../03-diagrams/outbox.md)
