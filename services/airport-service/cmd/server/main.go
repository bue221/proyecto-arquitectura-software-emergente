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
	"github.com/bue221/personal-itineraries/services/airport-service/internal/application"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/platform/config"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/platform/logging"
)

//go:embed openapi.yaml
var openAPI []byte

func main() {
	cfg := config.Load()
	log := logging.NewJSONLogger()

	cache := memorycache.New(cfg.CacheTTL)
	provider := colombia.NewAdapter(cfg.ColombiaAPIBaseURL, cfg.UpstreamTimeout, cache)

	handlers := httpapi.Handlers{
		GetAirport: application.GetAirport{Provider: provider},
		ListMap:    application.ListAirportsForMap{Provider: provider},
		Log:        log,
	}

	server := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           httpapi.NewRouter(handlers, openAPI),
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Info("airport_service_listening", "addr", cfg.HTTPAddr)
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
