# ADR-0009: mTLS en gRPC entre Airport e Itinerary

- **Estado:** Aceptado
- **Fecha:** 2026-10-19

## Contexto

El Nivel 3 exige seguridad servicio a servicio (mTLS o client credentials OAuth2) en la ruta gRPC que Itinerary usa para validar aeropuertos.

## Decisión

- Usar **mTLS** en el gRPC de Airport (`EnsureExists`) cuando `GRPC_MTLS_ENABLED=true`.
- Itinerary presenta un certificado de cliente (`AIRPORT_GRPC_MTLS_ENABLED=true`).
- Compose local monta `infra/certs/grpc` (CA autofirmada de desarrollo). Los tests unitarios siguen con credenciales inseguras salvo que mTLS esté activo.
- Regenerar con `./scripts/gen-grpc-certs.sh`.

## Consecuencias

- Las demos de Compose prueban autenticación S2S sin una PKI completa.
- La API HTTP de Airport sigue disponible (Gateway / navegador); solo el gRPC queda detrás de mTLS.
