# Observabilidad — OpenTelemetry + Jaeger (Nivel 2)

## Stack

| Pieza | URL / entorno |
|-------|----------------|
| UI de Jaeger | http://localhost:16686 |
| OTLP HTTP | `jaeger:4318` (Compose) |
| Entorno | `OTEL_EXPORTER_OTLP_ENDPOINT=jaeger:4318` en Gateway, Airport e Itinerary |

Las trazas usan W3C Trace Context. Los logs siguen exponiendo `X-Trace-Id` / `trace_id` (alineado al trace id de OTel cuando hay un span activo).

## Demo del camino feliz

1. `make up`
2. Crear un itinerario vía Gateway (JWT), o pegarle a `GET /api/v1/airports/1` por `:8080`.
3. Abrir Jaeger → servicio `api-gateway` → encontrar la traza que cruza Gateway → (Itinerary) → Airport.

## Demo de fallo controlado

```bash
curl -sI http://localhost:8080/api/v1/demo/fail
# se espera HTTP/1.1 503
```

En Jaeger, buscar el servicio `airport-service` (o `api-gateway`) y la operación `demo.controlled_failure`: el estado del span es **Error**.

## Relacionado

- Guion de demo: [Demo-script](Demo-script)
- Autoevaluación: [Self-assessment](Self-assessment)
