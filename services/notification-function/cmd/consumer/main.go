package main

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/bue221/personal-itineraries/services/notification-function/internal/adapters/in/rabbitmq"
	"github.com/bue221/personal-itineraries/services/notification-function/internal/adapters/out/postgres"
	"github.com/bue221/personal-itineraries/services/notification-function/internal/application"
	"github.com/bue221/personal-itineraries/services/notification-function/internal/platform/config"
	"github.com/bue221/personal-itineraries/services/notification-function/internal/platform/dbmigrate"
)

func main() {
	cfg := config.Load()
	log := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

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

	fn := application.SendNotificationFunction{
		Repo: postgres.NewRepository(pool),
		Log:  log,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "notification-function"})
	})
	server := &http.Server{Addr: cfg.HTTPAddr, Handler: mux, ReadHeaderTimeout: 5 * time.Second}
	go func() {
		log.Info("notification_health_listening", "addr", cfg.HTTPAddr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("health_server_failed", "error", err.Error())
		}
	}()

	consumer := rabbitmq.NewConsumer(cfg.RabbitMQURL, log)
	go func() {
		if err := consumer.Run(ctx, fn.Handle); err != nil && !errors.Is(err, context.Canceled) {
			log.Error("consumer_stopped", "error", err.Error())
			cancel()
		}
	}()

	<-ctx.Done()
	shutdownCtx, stop := context.WithTimeout(context.Background(), 5*time.Second)
	defer stop()
	_ = server.Shutdown(shutdownCtx)
	log.Info("notification_function_stopped")
}
