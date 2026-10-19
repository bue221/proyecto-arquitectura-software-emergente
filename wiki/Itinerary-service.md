> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Itinerary Service

**Status:** implemented (Level 1) — `services/itinerary-service` on port `8082`, Postgres host port `5434`, Swagger at `/swagger`.  
Outbox rows are written on create; RabbitMQ relay remains Level 2/3.

## Packing checklist

Each itinerary stores `packingItems` (JSONB): `{ id, label, packed, category? }`.
New itineraries seed a default domestic-trip list when the client sends none.
Update via `PUT /api/v1/itineraries/{id}` including the full packing array.

## Destination plans

Each itinerary stores `planItems` (JSONB): `{ id, title, description?, category?, selected, source? }`.
The web wizard step 2 sends selected recommendations / custom plans; empty array is valid (skip).
Migration: `000003_plan_items`.

## Why

Owns **Itinerary Planning**. Persists personal itineraries, validates airport references against Airport Service, and emits integration events through the Transactional Outbox.

## Minimum itinerary fields

- User name
- Origin airport ID
- Destination airport ID
- Travel date
- Duration (minutes)

## Responsibilities

- CRUD against dedicated Postgres.
- Versioned migrations (golang-migrate or Atlas).
- Validate airports via HTTP (L1/L2) or gRPC (L3).
- Write outbox in the same transaction as create.
- Expose Swagger/OpenAPI.

## Non-responsibilities

- Calling API Colombia directly
- Rendering maps
- Owning notification delivery

## Error strategy

| Condition | HTTP | Notes |
|-----------|------|-------|
| Invalid payload | 400 | Field-level validation messages |
| Airport missing | 422 or 400 | `airport_invalid` after downstream 404 |
| Not found | 404 | `itinerary_not_found` |
| Conflict / invariant | 409 | Reserved for future uniqueness rules |
| Downstream Airport down | 503 | Propagate failure with correlation id |

## Domain vs integration events

- Domain (optional, in-process): used only inside this service if needed.
- Integration: `ItineraryCreated` → AsyncAPI → RabbitMQ via outbox relay.

## Related diagrams

- [`../03-diagrams/outbox.md`](../03-diagrams/outbox.md)
- [`../03-diagrams/relational.md`](../03-diagrams/relational.md)
- [`../03-diagrams/sequences.md`](../03-diagrams/sequences.md)
