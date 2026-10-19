package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	HTTPAddr           string
	DatabaseURL        string
	AirportServiceURL  string
	AirportHTTPTimeout time.Duration
}

func Load() Config {
	return Config{
		HTTPAddr:           getEnv("HTTP_ADDR", ":8082"),
		DatabaseURL:        getEnv("DATABASE_URL", "postgres://itinerary:itinerary@localhost:5434/itinerary?sslmode=disable"),
		AirportServiceURL:  getEnv("AIRPORT_SERVICE_URL", "http://localhost:8081"),
		AirportHTTPTimeout: getDurationMS("AIRPORT_HTTP_TIMEOUT_MS", 5000),
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
