# Notification Function (Serverless)

## Why

Demonstrates the **serverless** architecture axis: work runs when events arrive (or on demand), without a permanent notification microservice owning the happy path of itineraries.

## Functions

| Function | Trigger | Behavior |
|----------|---------|----------|
| `SendNotificationFunction` | `ItineraryCreated` on RabbitMQ | Simulate email/log; persist `NotificationRecord` |
| `GenerateItineraryReportFunction` (optional) | On-demand HTTP/invoke | Aggregate metrics without loading core services |

## Data

Dedicated Postgres for notification history (one DB per “service” boundary).

## Error strategy

- At-least-once delivery → **idempotent** handlers (dedupe by event id / itinerary id).
- Failures → retry via broker policy; poison messages → DLQ + alert (L3).
- User-facing errors are not returned on the create itinerary sync path (async).

## Local simulation

Docker Compose wires LocalStack and/or OpenFaaS. Exact compose services land in implementation PRs; see [`../05-runbooks/local-setup.md`](../05-runbooks/local-setup.md).

## Related

- ADR-0006
- [`../03-diagrams/outbox.md`](../03-diagrams/outbox.md)
