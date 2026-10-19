package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	HTTPAddr            string
	AirportServiceURL   string
	ItineraryServiceURL string
	JWTSecret           string
	JWTIssuer           string
	JWTTTL              time.Duration
	RateLimitRPS        float64
	RateLimitBurst      int
	ProxyTimeout        time.Duration
}

func Load() Config {
	return Config{
		HTTPAddr:            getEnv("HTTP_ADDR", ":8080"),
		AirportServiceURL:   getEnv("AIRPORT_SERVICE_URL", "http://localhost:8081"),
		ItineraryServiceURL: getEnv("ITINERARY_SERVICE_URL", "http://localhost:8082"),
		JWTSecret:           getEnv("JWT_SIGNING_KEY", "dev-only-change-me"),
		JWTIssuer:           getEnv("JWT_ISSUER", "personal-itineraries-gateway"),
		JWTTTL:              getDurationMinutes("JWT_TTL_MINUTES", 120),
		RateLimitRPS:        getFloat("RATE_LIMIT_RPS", 20),
		RateLimitBurst:      getInt("RATE_LIMIT_BURST", 40),
		ProxyTimeout:        getDurationMS("PROXY_TIMEOUT_MS", 15000),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
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

func getFloat(key string, fallback float64) float64 {
	raw := os.Getenv(key)
	if raw == "" {
		return fallback
	}
	n, err := strconv.ParseFloat(raw, 64)
	if err != nil || n <= 0 {
		return fallback
	}
	return n
}

func getDurationMS(key string, fallbackMS int) time.Duration {
	return time.Duration(getInt(key, fallbackMS)) * time.Millisecond
}

func getDurationMinutes(key string, fallbackMin int) time.Duration {
	return time.Duration(getInt(key, fallbackMin)) * time.Minute
}
