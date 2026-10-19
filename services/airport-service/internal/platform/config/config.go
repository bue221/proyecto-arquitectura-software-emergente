package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	HTTPAddr           string
	ColombiaAPIBaseURL string
	UpstreamTimeout    time.Duration
	CacheTTL           time.Duration
}

func Load() Config {
	return Config{
		HTTPAddr:           getEnv("HTTP_ADDR", ":8081"),
		ColombiaAPIBaseURL: getEnv("COLOMBIA_API_BASE_URL", "https://api-colombia.com"),
		UpstreamTimeout:    getDurationMS("UPSTREAM_TIMEOUT_MS", 8000),
		CacheTTL:           getDurationMS("CACHE_TTL_MS", 300000),
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
