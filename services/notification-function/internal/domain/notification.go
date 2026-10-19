package domain

import (
	"context"
	"errors"
	"time"
)

var (
	ErrInvalidEvent     = errors.New("invalid_event")
	ErrPersistenceFailed = errors.New("persistence_failed")
)

// ItineraryCreated is the AsyncAPI payload for itinerary.created.
type ItineraryCreated struct {
	EventID              string `json:"eventId"`
	ItineraryID          string `json:"itineraryId"`
	UserName             string `json:"userName"`
	OriginAirportID      string `json:"originAirportId"`
	DestinationAirportID string `json:"destinationAirportId"`
	TravelDate           string `json:"travelDate"`
	DurationMinutes      int    `json:"durationMinutes"`
	OccurredAt           string `json:"occurredAt"`
}

type NotificationRecord struct {
	ID           string
	EventID      string
	ItineraryID  string
	Channel      string
	Status       string
	Payload      []byte
	CreatedAt    time.Time
}

type NotificationRepository interface {
	// SaveIdempotent inserts the record; returns inserted=false if event_id already exists.
	SaveIdempotent(ctx context.Context, record NotificationRecord) (inserted bool, err error)
}
