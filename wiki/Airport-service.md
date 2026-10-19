# Airport Service

**Estado:** Nivel 1 + Redis/CB + **gRPC N3** — HTTP `:8081` (Swagger), gRPC `:9091` (`EnsureExists`).

## Por qué

Es dueño del contexto **Catálogo de aeropuertos**. Aísla API Colombia detrás de un Adapter para que el resto del sistema (y Next.js) no dependa del esquema externo.

## Responsabilidades

- Obtener aeropuertos desde API Colombia.
- Mapear DTO externo → `Airport` de dominio → DTO de API/mapa.
- Cachear las respuestas adaptadas en Redis.
- Exponer REST para consulta por ID y listado del mapa, y gRPC `EnsureExists` para S2S de Itinerary.
- **mTLS** opcional en gRPC cuando `GRPC_MTLS_ENABLED=true` (default de Compose; ADR-0009).
- Overlay opcional **CONFIG_FILE** / Vault KV para la URL de Colombia y los timeouts (`infra/vault/README.md`).
- Resiliencia: timeout, retry + backoff + jitter, circuit breaker, bulkhead.

## Fuera de su responsabilidad

- CRUD de itinerarios
- Envío de notificaciones
- Emisión de JWT (eso es del Gateway)

## Esquema hexagonal

| Capa | Contenido |
|------|-----------|
| Dominio | `Airport`, puerto `AirportProvider`, errores |
| Aplicación | `GetAirport`, `ListAirportsForMap` |
| Adaptadores de entrada | Handlers HTTP, OpenAPI, servidor gRPC (N3) |
| Adaptadores de salida | Adapter HTTP Colombia, caché Redis (fallback en memoria), circuit breaker + retry |

## Resiliencia

- **Cache-aside:** Redis si `REDIS_ADDR` está definido; si Redis no responde, cae a memoria del proceso.
- **Timeout:** `UPSTREAM_TIMEOUT_MS` en el cliente HTTP de Colombia (default 8s).
- **Retry:** 3 intentos, backoff exponencial + full jitter (`200ms` → máximo `2s`).
- **Circuit breaker:** abre tras `CB_FAILURE_THRESHOLD` fallos consecutivos; enfriamiento `CB_COOLDOWN_MS`.
- **Bulkhead:** un semáforo limita llamadas concurrentes a Colombia (`BULKHEAD_MAX_CONCURRENT`, default 8).
- **Inspección:** `GET /api/v1/resilience` devuelve backend de caché + breaker + instantánea del bulkhead.
- **Métricas:** `GET /metrics` (Prometheus); Compose hace scrape vía `prometheus:9090` con alertas de CB abierto y rechazos del bulkhead.

## Estrategia de errores

| Condición | HTTP | Notas |
|-----------|------|-------|
| No encontrado | 404 | Código estable `airport_not_found` |
| Timeout upstream o CB abierto | 503 | `upstream_unavailable`; log + métricas |
| Validación | 400 | Path o query inválidos |
| Interno | 500 | Mensaje saneado; el detalle completo queda en logs |

## Observabilidad

Logs JSON con `trace_id` / `span_id`; spans alrededor de la llamada externa y del hit/miss de caché; métricas Prometheus del estado del CB y del ratio de aciertos de caché.

## Diagramas relacionados

- [Diagrams-adapter](Diagrams-adapter)
- [Diagrams-sequences](Diagrams-sequences)
