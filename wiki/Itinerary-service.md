# Itinerary Service

**Estado:** Nivel 1 + relay de outbox Nivel 2 — `services/itinerary-service` en el puerto `8082`, Postgres del host en `5434`, Swagger en `/swagger`.  
La creación escribe el outbox en la misma transacción; un **outbox relay** en proceso publica `ItineraryCreated` en RabbitMQ (`itinerary.events` / `itinerary.created`).

## Checklist de equipaje

Cada itinerario guarda `packingItems` (JSONB): `{ id, label, packed, category? }`.
Si el cliente no envía lista, los itinerarios nuevos reciben una lista semilla de viaje nacional.
Se actualiza con `PUT /api/v1/itineraries/{id}` enviando el arreglo completo.

## Planes en el destino

Cada itinerario guarda `planItems` (JSONB): `{ id, title, description?, category?, selected, source? }`.
El paso 2 del wizard web envía recomendaciones elegidas o planes propios; un arreglo vacío es válido (omitir).
Migración: `000003_plan_items`.

## Por qué

Es dueño de **Planificación de itinerarios**. Persiste itinerarios personales, valida las referencias de aeropuerto contra Airport Service y emite eventos de integración mediante el Transactional Outbox.

## Campos mínimos del itinerario

- Nombre de la persona
- ID del aeropuerto de origen
- ID del aeropuerto de destino
- Fecha de viaje
- Duración (minutos)

## Responsabilidades

- CRUD contra su Postgres dedicado.
- Migraciones versionadas (golang-migrate o Atlas).
- Validar aeropuertos por gRPC cuando `AIRPORT_GRPC_ADDR` está definido (default de Compose); si no, fallback HTTP.
- Certificados de cliente gRPC mTLS cuando `AIRPORT_GRPC_MTLS_ENABLED=true` (default de Compose; ADR-0009).
- Escribir el outbox en la misma transacción que la creación.
- Reenviar filas de outbox no publicadas a RabbitMQ (poller; marca `published_at`).
- Exponer Swagger/OpenAPI.
- Versionado por URI bajo `/api/v1` con header de respuesta `API-Version: 1` (ADR-0008).
- Listado paginado: `GET /api/v1/itineraries?page=&pageSize=` → `items`, `page`, `pageSize`, `total`, `totalPages`.

## Fuera de su responsabilidad

- Llamar a API Colombia de forma directa
- Renderizar mapas
- Ser dueño de la entrega de notificaciones

## Estrategia de errores

| Condición | HTTP | Notas |
|-----------|------|-------|
| Payload inválido | 400 | Mensajes de validación por campo |
| Aeropuerto inexistente | 422 o 400 | `airport_invalid` tras un 404 downstream |
| No encontrado | 404 | `itinerary_not_found` |
| Conflicto / invariante | 409 | Reservado para reglas futuras de unicidad |
| Airport downstream caído | 503 | Se propaga el fallo con id de correlación |

## Eventos de dominio frente a integración

- Dominio (opcional, en proceso): solo dentro de este servicio, si hace falta.
- Integración: `ItineraryCreated` → AsyncAPI → RabbitMQ vía outbox relay.

## Diagramas relacionados

- [Diagrams-outbox](Diagrams-outbox)
- [Diagrams-relational](Diagrams-relational)
- [Diagrams-sequences](Diagrams-sequences)
