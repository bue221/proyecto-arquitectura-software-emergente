# syntax=docker/dockerfile:1.7
FROM golang:1.23-alpine AS build
WORKDIR /src

RUN apk add --no-cache git ca-certificates

COPY packages/proto/go.mod packages/proto/go.sum packages/proto/
COPY services/itinerary-service/go.mod services/itinerary-service/go.sum services/itinerary-service/
WORKDIR /src/services/itinerary-service
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

WORKDIR /src
COPY packages/proto packages/proto
COPY services/itinerary-service services/itinerary-service
WORKDIR /src/services/itinerary-service
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/itinerary-service ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
COPY --from=build /out/itinerary-service /itinerary-service
EXPOSE 8082
USER nonroot:nonroot
ENTRYPOINT ["/itinerary-service"]
