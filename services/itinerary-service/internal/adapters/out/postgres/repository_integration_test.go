package postgres_test

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/testcontainers/testcontainers-go"
	tcpostgres "github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"

	pgadapter "github.com/bue221/personal-itineraries/services/itinerary-service/internal/adapters/out/postgres"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/platform/dbmigrate"
)

func TestRepository_CreateWritesItineraryAndOutbox(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping testcontainers in -short mode (keep PR CI under 3m)")
	}

	ctx := context.Background()
	container, err := tcpostgres.Run(ctx,
		"postgres:16-alpine",
		tcpostgres.WithDatabase("itinerary"),
		tcpostgres.WithUsername("itinerary"),
		tcpostgres.WithPassword("itinerary"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(60*time.Second),
		),
	)
	if err != nil {
		t.Fatalf("start postgres: %v", err)
	}
	t.Cleanup(func() {
		_ = testcontainers.TerminateContainer(container)
	})

	dsn, err := container.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		t.Fatalf("connection string: %v", err)
	}

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatalf("pool: %v", err)
	}
	t.Cleanup(pool.Close)

	if err := dbmigrate.Up(ctx, pool); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	repo := pgadapter.NewRepository(pool)
	now := time.Date(2026, 10, 19, 12, 0, 0, 0, time.UTC)
	itineraryID := "11111111-1111-1111-1111-111111111111"
	eventID := "22222222-2222-2222-2222-222222222222"
	payload, _ := json.Marshal(map[string]any{
		"eventId":     eventID,
		"itineraryId": itineraryID,
		"occurredAt":  now.Format(time.RFC3339),
	})

	created, err := repo.Create(ctx, domain.Itinerary{
		ID:                   itineraryID,
		UserName:             "E2E",
		OriginAirportID:      "1",
		DestinationAirportID: "2",
		TravelDate:           now,
		DurationMinutes:      90,
		PackingItems:         domain.DefaultPackingList(),
		PlanItems:            []domain.PlanItem{},
		CreatedAt:            now,
		UpdatedAt:            now,
	}, domain.OutboxMessage{
		ID:            eventID,
		AggregateType: "itinerary",
		AggregateID:   itineraryID,
		EventType:     "ItineraryCreated",
		Payload:       payload,
		OccurredAt:    now,
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if created.UserName != "E2E" {
		t.Fatalf("unexpected itinerary: %+v", created)
	}

	got, err := repo.GetByID(ctx, created.ID)
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if got.OriginAirportID != "1" || got.DestinationAirportID != "2" {
		t.Fatalf("get mismatch: %+v", got)
	}

	pending, err := repo.ListUnpublished(ctx, 10)
	if err != nil {
		t.Fatalf("outbox: %v", err)
	}
	if len(pending) != 1 || pending[0].EventType != "ItineraryCreated" {
		t.Fatalf("outbox pending=%+v", pending)
	}
}
