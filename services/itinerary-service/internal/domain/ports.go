package domain

import (
	"context"
	"time"
)

// AirportValidator checks airport existence in the Airport Catalog BC.
type AirportValidator interface {
	EnsureExists(ctx context.Context, airportID string) error
}

// ItineraryRepository persists itineraries and outbox rows.
type ItineraryRepository interface {
	Create(ctx context.Context, itinerary Itinerary, outbox OutboxMessage) (Itinerary, error)
	Update(ctx context.Context, itinerary Itinerary) (Itinerary, error)
	Delete(ctx context.Context, id string) error
	GetByID(ctx context.Context, id string) (Itinerary, error)
	List(ctx context.Context) ([]Itinerary, error)
}

// OutboxMessage is an integration event pending reliable publication.
type OutboxMessage struct {
	ID            string
	AggregateType string
	AggregateID   string
	EventType     string
	Payload       []byte
	OccurredAt    time.Time
}
