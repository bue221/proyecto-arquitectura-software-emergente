package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	HTTPAddr             string
	DatabaseURL          string
	AirportServiceURL    string
	AirportHTTPTimeout   time.Duration
	RabbitMQURL          string
	OutboxRelayEnabled   bool
	OutboxPollInterval   time.Duration
	OutboxBatchSize      int
	OTelEndpoint         string
}

func Load() Config {
	return Config{
		HTTPAddr:           getEnv("HTTP_ADDR", ":8082"),
		DatabaseURL:        getEnv("DATABASE_URL", "postgres://itinerary:itinerary@localhost:5434/itinerary?sslmode=disable"),
		AirportServiceURL:  getEnv("AIRPORT_SERVICE_URL", "http://localhost:8081"),
		AirportHTTPTimeout: getDurationMS("AIRPORT_HTTP_TIMEOUT_MS", 5000),
		RabbitMQURL:        getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
		OutboxRelayEnabled: getBool("OUTBOX_RELAY_ENABLED", true),
		OutboxPollInterval: getDurationMS("OUTBOX_POLL_INTERVAL_MS", 2000),
		OutboxBatchSize:    getInt("OUTBOX_BATCH_SIZE", 20),
		OTelEndpoint:       getEnv("OTEL_EXPORTER_OTLP_ENDPOINT", ""),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getDurationMS(key string, fallbackMS int) time.Duration {
	raw := os.Getenv(key)
	if raw == "" {
		return time.Duration(fallbackMS) * time.Millisecond
	}
	ms, err := strconv.Atoi(raw)
	if err != nil || ms <= 0 {
		return time.Duration(fallbackMS) * time.Millisecond
	}
	return time.Duration(ms) * time.Millisecond
}

func getInt(key string, fallback int) int {
	raw := os.Getenv(key)
	if raw == "" {
		return fallback
	}
	n, err := strconv.Atoi(raw)
	if err != nil || n <= 0 {
		return fallback
	}
	return n
}

func getBool(key string, fallback bool) bool {
	raw := os.Getenv(key)
	if raw == "" {
		return fallback
	}
	v, err := strconv.ParseBool(raw)
	if err != nil {
		return fallback
	}
	return v
}
