# Local gRPC mTLS materials (dev only)

Self-signed CA + server/client certs for Airport ↔ Itinerary demos.

Regenerate:

```bash
./scripts/gen-grpc-certs.sh
```

**Not for production.** Private keys are intentionally committed so `make up` works without extra steps.
