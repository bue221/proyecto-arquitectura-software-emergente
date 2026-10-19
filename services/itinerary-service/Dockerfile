FROM golang:1.22-alpine AS build
WORKDIR /src
COPY packages/proto packages/proto
COPY services/itinerary-service services/itinerary-service
WORKDIR /src/services/itinerary-service
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/itinerary-service ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
COPY --from=build /out/itinerary-service /itinerary-service
EXPOSE 8082
USER nonroot:nonroot
ENTRYPOINT ["/itinerary-service"]
