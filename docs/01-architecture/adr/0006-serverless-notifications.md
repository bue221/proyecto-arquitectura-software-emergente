# ADR-0006: Serverless notifications via local FaaS simulation

- **Status:** Accepted
- **Date:** 2026-10-19

## Context

Notifications must not be a permanently running business microservice for the course’s serverless axis. Local cloud simulation is required (LocalStack, Knative, or OpenFaaS).

## Decision

Implement `notification-function` as **FaaS-style handlers** triggered by RabbitMQ (`ItineraryCreated`) and an optional on-demand report function. Locally orchestrate with **LocalStack** and/or **OpenFaaS** behind Docker Compose. Persist notification history in a dedicated Postgres database.

## Consequences

- Pros: matches serverless rubric; scales to zero conceptually.
- Cons: local FaaS tooling adds Compose complexity; cold starts in demos.
