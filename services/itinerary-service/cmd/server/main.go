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

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/adapters/in/httpapi"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/adapters/out/airporthttp"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/adapters/out/postgres"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/application"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/platform/config"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/platform/dbmigrate"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/platform/logging"
)

//go:embed openapi.yaml
var openAPI []byte

func main() {
	cfg := config.Load()
	log := logging.NewJSONLogger()

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Error("db_connect_failed", "error", err.Error())
		os.Exit(1)
	}
	defer pool.Close()

	if err := dbmigrate.Up(ctx, pool); err != nil {
		log.Error("db_migrate_failed", "error", err.Error())
		os.Exit(1)
	}

	repo := postgres.NewRepository(pool)
	airports := airporthttp.New(cfg.AirportServiceURL, cfg.AirportHTTPTimeout)

	handlers := httpapi.Handlers{
		CreateUC: application.CreateItinerary{Repo: repo, Airports: airports},
		UpdateUC: application.UpdateItinerary{Repo: repo, Airports: airports},
		GetUC:    application.GetItinerary{Repo: repo},
		ListUC:   application.ListItineraries{Repo: repo},
		DeleteUC: application.DeleteItinerary{Repo: repo},
		Log:      log,
	}

	server := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           httpapi.NewRouter(handlers, openAPI),
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Info("itinerary_service_listening", "addr", cfg.HTTPAddr)
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
	log.Info("itinerary_service_stopped")
}
