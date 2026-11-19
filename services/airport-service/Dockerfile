# syntax=docker/dockerfile:1.7
FROM golang:1.23-alpine AS build
WORKDIR /src

RUN apk add --no-cache git ca-certificates

COPY packages/proto/go.mod packages/proto/go.sum packages/proto/
COPY services/airport-service/go.mod services/airport-service/go.sum services/airport-service/
WORKDIR /src/services/airport-service
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

WORKDIR /src
COPY packages/proto packages/proto
COPY services/airport-service services/airport-service
WORKDIR /src/services/airport-service
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/airport-service ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
COPY --from=build /out/airport-service /airport-service
EXPOSE 8081 9091
USER nonroot:nonroot
ENTRYPOINT ["/airport-service"]
