# Función de notificación (serverless)

**Estado:** Nivel 2 implementado — worker de Compose `notification-function` en `:8083` (simulación local estilo FaaS, ADR-0006).

## Por qué

Muestra el eje **serverless**: el trabajo corre cuando llega un evento, sin un microservicio de negocio permanente que sea dueño de crear el itinerario.

## Funciones

| Función | Disparador | Comportamiento |
|---------|------------|----------------|
| `SendNotificationFunction` | `itinerary.created` en RabbitMQ | Simula correo/log; persiste `notification_records` |
| `GenerateItineraryReportFunction` (opcional) | HTTP o invoke bajo demanda | Agrega métricas — pendiente |

## Runtime (local)

| Pieza | Detalle |
|-------|---------|
| Contenedor | `services/notification-function` |
| Salud | `GET http://localhost:8083/health` |
| Cola | `notification.itinerary-created` unida al exchange `itinerary.events` / key `itinerary.created` |
| BD | Postgres `notification-db`, puerto de host `5435` (una BD por servicio) |

El empaquetado OpenFaaS puede envolver el mismo handler más adelante; el caso de uso de dominio no cambia.

## Datos

`notification_records (id, event_id UNIQUE, itinerary_id, channel, status, payload, created_at)`.

## Estrategia de errores

- Entrega at-least-once → handlers **idempotentes** (deduplicar por `event_id`).
- Fallo del handler → Nack + requeue; poison / DLQ más adelante (N3).
- Los errores de cara al usuario **no** vuelven por la ruta síncrona de crear itinerario.

## Relacionado

- ADR-0006, ADR-0003
- AsyncAPI: `packages/contracts/asyncapi/itinerary-events.yaml`
- [Diagrams-outbox](Diagrams-outbox)
