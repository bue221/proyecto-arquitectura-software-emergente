package main

import (
	"context"
	_ "embed"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bue221/personal-itineraries/services/airport-service/internal/adapters/in/httpapi"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/adapters/out/colombia"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/adapters/out/memorycache"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/adapters/out/rediscache"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/adapters/out/resilience"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/application"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/domain"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/platform/config"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/platform/logging"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/platform/otelx"
)

//go:embed openapi.yaml
var openAPI []byte

func main() {
	cfg := config.Load()
	log := logging.NewJSONLogger()

	ctx := context.Background()
	shutdownTracing, err := otelx.Init(ctx, "airport-service", cfg.OTelEndpoint)
	if err != nil {
		log.Error("otel_init_failed", "error", err.Error())
		os.Exit(1)
	}
	defer func() { _ = shutdownTracing(context.Background()) }()
	if cfg.OTelEndpoint != "" {
		log.Info("otel_enabled", "endpoint", cfg.OTelEndpoint)
	}

	cache, cacheBackend := buildCache(cfg, log)
	breaker := resilience.NewBreaker(cfg.CBFailureThreshold, cfg.CBCooldown)
	provider := colombia.NewAdapter(cfg.ColombiaAPIBaseURL, cfg.UpstreamTimeout, cache, breaker)

	handlers := httpapi.Handlers{
		GetAirport: application.GetAirport{Provider: provider},
		ListMap:    application.ListAirportsForMap{Provider: provider},
		Resilience: func() map[string]any {
			return map[string]any{
				"cache_backend": cacheBackend,
				"circuit_breaker": provider.BreakerSnapshot(),
				"retry": map[string]any{
					"max_attempts": 3,
					"base_delay_ms": 200,
					"max_delay_ms":  2000,
					"jitter":        "full",
				},
			}
		},
		Log: log,
	}

	server := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           httpapi.NewRouter(handlers, openAPI),
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Info("airport_service_listening", "addr", cfg.HTTPAddr, "cache_backend", cacheBackend)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("server_failed", "error", err.Error())
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = server.Shutdown(ctx)
	log.Info("airport_service_stopped")
}

func buildCache(cfg config.Config, log interface {
	Info(string, ...any)
	Warn(string, ...any)
}) (domain.AirportCache, string) {
	if cfg.RedisAddr == "" {
		log.Info("cache_backend_selected", "backend", "memory")
		return memorycache.New(cfg.CacheTTL), "memory"
	}
	rc, err := rediscache.New(cfg.RedisAddr, cfg.CacheTTL)
	if err != nil {
		log.Warn("redis_unavailable_falling_back_to_memory", "addr", cfg.RedisAddr, "error", err.Error())
		return memorycache.New(cfg.CacheTTL), "memory"
	}
	log.Info("cache_backend_selected", "backend", "redis", "addr", cfg.RedisAddr)
	return rc, "redis"
}
