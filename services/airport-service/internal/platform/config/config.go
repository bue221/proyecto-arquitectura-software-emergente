package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	HTTPAddr           string
	GRPCAddr           string
	ColombiaAPIBaseURL string
	UpstreamTimeout    time.Duration
	CacheTTL           time.Duration
	RedisAddr          string
	CBFailureThreshold int
	CBCooldown         time.Duration
	OTelEndpoint       string
	GRPCmTLS           bool
	GRPCTLSCertFile    string
	GRPCTLSKeyFile     string
	GRPCTLSCAFile      string
	BulkheadMax        int
}

func Load() Config {
	cfg := Config{
		HTTPAddr:           getEnv("HTTP_ADDR", ":8081"),
		GRPCAddr:           getEnv("GRPC_ADDR", ":9091"),
		ColombiaAPIBaseURL: getEnv("COLOMBIA_API_BASE_URL", "https://api-colombia.com"),
		UpstreamTimeout:    getDurationMS("UPSTREAM_TIMEOUT_MS", 8000),
		CacheTTL:           getDurationMS("CACHE_TTL_MS", 300000),
		RedisAddr:          getEnv("REDIS_ADDR", ""),
		CBFailureThreshold: getInt("CB_FAILURE_THRESHOLD", 5),
		CBCooldown:         getDurationMS("CB_COOLDOWN_MS", 30000),
		OTelEndpoint:       getEnv("OTEL_EXPORTER_OTLP_ENDPOINT", ""),
		GRPCmTLS:           getBool("GRPC_MTLS_ENABLED", false),
		GRPCTLSCertFile:    getEnv("GRPC_TLS_CERT_FILE", ""),
		GRPCTLSKeyFile:     getEnv("GRPC_TLS_KEY_FILE", ""),
		GRPCTLSCAFile:      getEnv("GRPC_TLS_CA_FILE", ""),
		BulkheadMax:        getInt("BULKHEAD_MAX_CONCURRENT", 8),
	}
	// Optional overlays: config file (rendered by Vault Agent / config server) then live Vault KV.
	_ = ApplyConfigFile(&cfg, os.Getenv("CONFIG_FILE"))
	_ = ApplyVaultKV(&cfg)
	return cfg
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
