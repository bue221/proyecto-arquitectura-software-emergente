# Guion de demo (evidencia de rúbrica)

Usa este guion para grabaciones o capturas. Marca los ítems a medida que se cubren.

## Parte automatizada

Con el stack arriba (`make up` + `make smoke`):

```bash
make demo-evidence
```

Escribe capturas bajo `docs/05-runbooks/evidence/<timestamp>/` (las carpetas de corrida están en `.gitignore`).

## Nivel 1

1. Mostrar la estructura del repo + el inicio de la wiki + los ADRs.
2. Abrir el mapa del Studio en Next.js con al menos un marcador (Leaflet) — `http://localhost:3001`.
3. Crear un itinerario por UI o HTTP; mostrar Swagger.
4. Mostrar la fila del itinerario en Postgres.
5. Mostrar Docker Compose con servicios y bases en marcha.
6. Mostrar una línea de log estructurado con `trace_id`.

## Nivel 2

1. Romper o simular API Colombia → el circuit breaker abre (métricas/logs).
2. Acierto de caché Redis después del calentamiento.
3. Petición por el Gateway con JWT; rechazo sin token (`make demo-evidence` cubre HTTP).
4. La notificación aparece después del create (async).
5. Recorrido del archivo AsyncAPI.
6. UI de Jaeger (`:16686`): Gateway → Itinerary → Airport; luego `GET /api/v1/demo/fail`.
7. Salida E2E con Testcontainers.

## Nivel 3

1. Explicar outbox + relay (double-write).
2. Llamada gRPC Itinerary → Airport.
3. GitHub Actions en verde: **ci** + **sonar** + **cd-example**.
4. Manifiestos K8s con probes `/ready` y `/live`.
5. Alerta Prometheus y/o Toxiproxy.
6. Salida Pact.
7. Prueba de carga: `make load` — mostrar latencia p95 y el Gateway respondiendo `429` ante ráfagas (ver [Quality](Quality)).
8. Autoevaluación completa en [Self-assessment](Self-assessment).

## Tablero de entrega

Seguimiento en Issues de GitHub — [Delivery-board](Delivery-board).
