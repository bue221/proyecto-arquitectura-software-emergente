# ADR-0005: Transactional Outbox for integration events

- **Status:** Accepted
- **Date:** 2026-10-19

## Context

Level 3 requires solving the Double Write Problem: writing to Postgres and publishing to RabbitMQ as two independent I/O operations can lose events or publish without a committed itinerary.

## Decision

Itinerary Service persists `itineraries` and `outbox` rows in **one database transaction**. A relay worker (poller or CDC-style) publishes pending outbox records to RabbitMQ and marks them published. Consumers are **idempotent**.

## Consequences

- Pros: at-least-once delivery with recoverable gaps; clear story for the rubric.
- Cons: eventual consistency; need relay monitoring and dead-letter strategy.
