# notification-function

FaaS-style consumer for `ItineraryCreated` (Level 2).

## Local behavior

- Trigger: RabbitMQ queue `notification.itinerary-created` (routing key `itinerary.created`)
- Handler: `SendNotificationFunction` — simulates email, persists `notification_records` (dedicated DB)
- Idempotent on `event_id` (unique index)
- Health: `GET :8083/health`

This Compose worker is the **local serverless simulation** (ADR-0006). OpenFaaS packaging can wrap the same handler later without changing the domain use case.

## Env

| Variable | Default |
|----------|---------|
| `DATABASE_URL` | `postgres://notify:notify@localhost:5435/notify?sslmode=disable` |
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672/` |
| `HTTP_ADDR` | `:8083` |

## Spec

[`../../docs/02-services/notification-function.md`](../../docs/02-services/notification-function.md)
