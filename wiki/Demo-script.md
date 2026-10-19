# Guion de demo (evidencia de rúbrica)

Usa este guion para grabaciones o capturas. Marca los ítems a medida que se cubren los niveles.

## Nivel 1

1. Mostrar la estructura del repo + el inicio de la wiki + los ADRs.
2. Abrir el mapa del Studio en Next.js con al menos un marcador de aeropuerto (Leaflet).
3. Crear un itinerario por UI o HTTP; mostrar Swagger.
4. Mostrar la fila del itinerario en Postgres.
5. Mostrar Docker Compose con servicios y bases en marcha.
6. Mostrar una línea de log estructurado con `trace_id`.

## Nivel 2

1. Romper o simular API Colombia → el circuit breaker abre (métricas/logs).
2. Acierto de caché Redis después del calentamiento.
3. Petición por el Gateway con JWT; rechazo sin token.
4. La notificación aparece después del create (async).
5. Recorrido del archivo AsyncAPI.
6. UI de Jaeger (`:16686`): Gateway → Itinerary → Airport en el create; luego el span de error de `GET /api/v1/demo/fail`.
7. Salida de la corrida E2E con Testcontainers.

## Nivel 3

1. Explicar la tabla outbox + el relay (diapositiva del double-write).
2. Llamada gRPC Itinerary → Airport (grpcurl o traza).
3. GitHub Actions en verde + compuerta de Sonar.
4. Manifiestos K8s con readiness/liveness (`infra/k8s/`, probes `/ready` y `/live`).
5. Ejemplo de alerta (Prometheus `:9090`) y/o latencia con Toxiproxy (`infra/toxiproxy/README.md`).
6. Salida del test de contrato Pact.
7. Tabla de autoevaluación completa en [Self-assessment](Self-assessment).
