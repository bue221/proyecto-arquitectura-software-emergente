# ADR-0003: RabbitMQ as the message broker

- **Status:** Accepted
- **Date:** 2026-10-19

## Context

Itinerary creation must notify other components asynchronously with a documented contract (AsyncAPI). Kafka is valid but heavier for local academic demos.

## Decision

Use **RabbitMQ** with a dedicated exchange/queue for itinerary integration events. Document publishers/consumers with AsyncAPI under `packages/contracts/asyncapi/`.

## Consequences

- Pros: simple local Compose setup; clear routing; good fit for FaaS triggers.
- Cons: if volume/partitioning needs grow, revisit Kafka in a new ADR.
