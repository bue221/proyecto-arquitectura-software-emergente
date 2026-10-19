package application

import (
	"context"
	"log/slog"
	"time"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
)

// Routing keys must stay aligned with packages/contracts/asyncapi/itinerary-events.yaml
const RoutingKeyItineraryCreated = "itinerary.created"

// OutboxRelay polls unpublished outbox rows and publishes them to the broker.
type OutboxRelay struct {
	Store     domain.OutboxStore
	Publisher domain.EventPublisher
	Log       *slog.Logger
	BatchSize int
	Interval  time.Duration
	Now       func() time.Time
}

func (r OutboxRelay) Run(ctx context.Context) {
	interval := r.Interval
	if interval <= 0 {
		interval = 2 * time.Second
	}
	batch := r.BatchSize
	if batch <= 0 {
		batch = 20
	}
	log := r.Log
	if log == nil {
		log = slog.Default()
	}

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		if err := r.DrainOnce(ctx, batch); err != nil {
			log.Error("outbox_relay_tick_failed", "error", err.Error())
		}
		select {
		case <-ctx.Done():
			log.Info("outbox_relay_stopped")
			return
		case <-ticker.C:
		}
	}
}

func (r OutboxRelay) DrainOnce(ctx context.Context, limit int) error {
	rows, err := r.Store.ListUnpublished(ctx, limit)
	if err != nil {
		return err
	}
	if len(rows) == 0 {
		return nil
	}

	now := time.Now().UTC()
	if r.Now != nil {
		now = r.Now().UTC()
	}

	for _, msg := range rows {
		routingKey := routingKeyFor(msg.EventType)
		if err := r.Publisher.Publish(ctx, routingKey, msg.ID, msg.Payload); err != nil {
			_ = r.Store.BumpAttempts(ctx, msg.ID)
			if r.Log != nil {
				r.Log.Error("outbox_publish_failed",
					"outbox_id", msg.ID,
					"event_type", msg.EventType,
					"error", err.Error(),
				)
			}
			continue
		}
		if err := r.Store.MarkPublished(ctx, msg.ID, now); err != nil {
			if r.Log != nil {
				r.Log.Error("outbox_mark_published_failed",
					"outbox_id", msg.ID,
					"error", err.Error(),
				)
			}
			continue
		}
		if r.Log != nil {
			r.Log.Info("outbox_published",
				"outbox_id", msg.ID,
				"event_type", msg.EventType,
				"routing_key", routingKey,
			)
		}
	}
	return nil
}

func routingKeyFor(eventType string) string {
	switch eventType {
	case "ItineraryCreated":
		return RoutingKeyItineraryCreated
	default:
		return eventType
	}
}
