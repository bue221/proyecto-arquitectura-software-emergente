# Protobuf / gRPC

## Airport Catalog (`airport/v1`)

| RPC | Use |
|-----|-----|
| `EnsureExists` | Itinerary Service validates airport ids (Level 3 S2S) |

Generated Go lives under `gen/go/` (committed). Regenerate:

```bash
protoc \
  --proto_path=packages/proto \
  --go_out=packages/proto/gen/go --go_opt=paths=source_relative \
  --go-grpc_out=packages/proto/gen/go --go-grpc_opt=paths=source_relative \
  packages/proto/airport/v1/airport.proto
```

Local Compose: Airport gRPC `:9091`, Itinerary uses `AIRPORT_GRPC_ADDR=airport-service:9091` (insecure for local; mTLS later).
