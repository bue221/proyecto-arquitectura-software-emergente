# ADR-0009: gRPC mTLS for Airport ↔ Itinerary

- **Status:** Accepted
- **Date:** 2026-10-19

## Context

Level 3 requires service-to-service security (mTLS or OAuth2 client credentials) for the gRPC path used by Itinerary to validate airports.

## Decision

- Use **mutual TLS** on Airport gRPC (`EnsureExists`) when `GRPC_MTLS_ENABLED=true`.
- Itinerary presents a client certificate (`AIRPORT_GRPC_MTLS_ENABLED=true`).
- Local Compose mounts `infra/certs/grpc` (dev self-signed CA). Unit tests keep insecure credentials unless mTLS is enabled.
- Regenerate with `./scripts/gen-grpc-certs.sh`.

## Consequences

- Compose demos prove S2S auth without a full PKI.
- HTTP Airport API remains available (Gateway / browser); only gRPC is mTLS-gated.
