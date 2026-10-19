> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# API Gateway

**Estado:** implementado (inicio del Nivel 2) — `services/api-gateway` en el puerto `8080`.

## Por qué

Único punto de entrada para el navegador y los clientes externos. Deja el enrutamiento, los rate limits y el JWT fuera de los servicios de dominio.

## Qué hace

| Preocupación | Comportamiento |
|--------------|----------------|
| Enrutamiento | `/api/v1/airports*` → Airport Service; `/api/v1/itineraries*` → Itinerary Service |
| Auth | JWT obligatorio en rutas de itinerario; `POST /auth/token` emite tokens de demo |
| Propagación | Reenvía `Authorization` y `X-Trace-Id`; fija `X-User-Sub` y `X-User-Role` |
| Rate limit | Token bucket por IP de cliente |
| Salud | `GET /health` |

## Qué no hace

- Reglas del adapter o del catálogo de aeropuertos
- Invariantes del itinerario ni outbox
- Envío de notificaciones

## Relacionado

- ADR-0007
- El frontend usa `NEXT_PUBLIC_API_GATEWAY_URL` (por defecto `http://localhost:8080`)
