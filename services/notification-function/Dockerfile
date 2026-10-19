FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/notification-function ./cmd/consumer

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
COPY --from=build /out/notification-function /notification-function
EXPOSE 8083
USER nonroot:nonroot
ENTRYPOINT ["/notification-function"]
