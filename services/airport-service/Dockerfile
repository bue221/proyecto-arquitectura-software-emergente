FROM golang:1.22-alpine AS build
WORKDIR /src
COPY packages/proto packages/proto
COPY services/airport-service services/airport-service
WORKDIR /src/services/airport-service
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/airport-service ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
COPY --from=build /out/airport-service /airport-service
EXPOSE 8081 9091
USER nonroot:nonroot
ENTRYPOINT ["/airport-service"]
