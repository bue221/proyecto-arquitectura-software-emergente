package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bue221/personal-itineraries/services/api-gateway/internal/auth"
	"github.com/bue221/personal-itineraries/services/api-gateway/internal/httpapi"
	"github.com/bue221/personal-itineraries/services/api-gateway/internal/platform/config"
	"github.com/bue221/personal-itineraries/services/api-gateway/internal/platform/logging"
	"github.com/bue221/personal-itineraries/services/api-gateway/internal/platform/otelx"
	"github.com/bue221/personal-itineraries/services/api-gateway/internal/proxy"
)

func main() {
	cfg := config.Load()
	log := logging.NewJSONLogger()

	ctx := context.Background()
	shutdownTracing, err := otelx.Init(ctx, "api-gateway", cfg.OTelEndpoint)
	if err != nil {
		log.Error("otel_init_failed", "error", err.Error())
		os.Exit(1)
	}
	defer func() { _ = shutdownTracing(context.Background()) }()
	if cfg.OTelEndpoint != "" {
		log.Info("otel_enabled", "endpoint", cfg.OTelEndpoint)
	}

	airportProxy, err := proxy.New(cfg.AirportServiceURL, cfg.ProxyTimeout)
	if err != nil {
		log.Error("airport_proxy_invalid", "error", err.Error())
		os.Exit(1)
	}
	itineraryProxy, err := proxy.New(cfg.ItineraryServiceURL, cfg.ProxyTimeout)
	if err != nil {
		log.Error("itinerary_proxy_invalid", "error", err.Error())
		os.Exit(1)
	}

	tokens := auth.NewTokenService(cfg.JWTSecret, cfg.JWTIssuer, cfg.JWTTTL)
	handlers := httpapi.Handlers{Tokens: tokens}
	router := httpapi.NewRouter(handlers, tokens, httpapi.Upstream{
		Airport:   airportProxy,
		Itinerary: itineraryProxy,
	}, cfg.RateLimitRPS, cfg.RateLimitBurst)

	server := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Info("api_gateway_listening", "addr", cfg.HTTPAddr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("server_failed", "error", err.Error())
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = server.Shutdown(shutdownCtx)
	log.Info("api_gateway_stopped")
}
