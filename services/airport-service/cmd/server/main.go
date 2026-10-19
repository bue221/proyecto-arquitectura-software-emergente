package main

import (
	"context"
	_ "embed"
	"errors"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"google.golang.org/grpc"

	airportv1 "github.com/bue221/personal-itineraries/packages/proto/gen/go/airport/v1"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/adapters/in/grpcapi"
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
	getAirport := application.GetAirport{Provider: provider}

	handlers := httpapi.Handlers{
		GetAirport: getAirport,
		ListMap:    application.ListAirportsForMap{Provider: provider},
		Resilience: func() map[string]any {
			return map[string]any{
				"cache_backend": cacheBackend,
				"circuit_breaker": provider.BreakerSnapshot(),
				"retry": map[string]any{
					"max_attempts":  3,
					"base_delay_ms": 200,
					"max_delay_ms":  2000,
					"jitter":        "full",
				},
			}
		},
		Log: log,
	}

	httpServer := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           httpapi.NewRouter(handlers, openAPI),
		ReadHeaderTimeout: 5 * time.Second,
	}

	grpcServer := grpc.NewServer()
	airportv1.RegisterAirportServiceServer(grpcServer, &grpcapi.Server{
		GetAirport: getAirport,
		Log:        log,
	})

	go func() {
		log.Info("airport_service_listening", "addr", cfg.HTTPAddr, "cache_backend", cacheBackend)
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("http_server_failed", "error", err.Error())
			os.Exit(1)
		}
	}()

	go func() {
		lis, err := net.Listen("tcp", cfg.GRPCAddr)
		if err != nil {
			log.Error("grpc_listen_failed", "addr", cfg.GRPCAddr, "error", err.Error())
			os.Exit(1)
		}
		log.Info("airport_grpc_listening", "addr", cfg.GRPCAddr)
		if err := grpcServer.Serve(lis); err != nil {
			log.Error("grpc_server_failed", "error", err.Error())
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	grpcServer.GracefulStop()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = httpServer.Shutdown(shutdownCtx)
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
