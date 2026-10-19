package application

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/bue221/personal-itineraries/services/notification-function/internal/domain"
	"github.com/google/uuid"
)

// SendNotificationFunction is the FaaS-style handler for ItineraryCreated.
type SendNotificationFunction struct {
	Repo  domain.NotificationRepository
	Log   *slog.Logger
	Now   func() time.Time
	NewID func() string
}

func (fn SendNotificationFunction) Handle(ctx context.Context, raw []byte) error {
	var event domain.ItineraryCreated
	if err := json.Unmarshal(raw, &event); err != nil {
		return fmt.Errorf("%w: %v", domain.ErrInvalidEvent, err)
	}
	if event.EventID == "" || event.ItineraryID == "" {
		return fmt.Errorf("%w: missing eventId/itineraryId", domain.ErrInvalidEvent)
	}

	now := time.Now().UTC()
	if fn.Now != nil {
		now = fn.Now().UTC()
	}
	id := uuid.NewString()
	if fn.NewID != nil {
		id = fn.NewID()
	}

	record := domain.NotificationRecord{
		ID:          id,
		EventID:     event.EventID,
		ItineraryID: event.ItineraryID,
		Channel:     "email_sim",
		Status:      "sent",
		Payload:     raw,
		CreatedAt:   now,
	}

	inserted, err := fn.Repo.SaveIdempotent(ctx, record)
	if err != nil {
		return err
	}

	log := fn.Log
	if log == nil {
		log = slog.Default()
	}
	if !inserted {
		log.Info("notification_duplicate_skipped",
			"event_id", event.EventID,
			"itinerary_id", event.ItineraryID,
		)
		return nil
	}

	// Simulated side-effect (email/push) — never affects the sync create path.
	log.Info("notification_sent",
		"event_id", event.EventID,
		"itinerary_id", event.ItineraryID,
		"user_name", event.UserName,
		"origin", event.OriginAirportID,
		"destination", event.DestinationAirportID,
		"channel", record.Channel,
	)
	return nil
}
