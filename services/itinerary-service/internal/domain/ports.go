package domain

import (
	"context"
	"time"
)

// AirportValidator checks airport existence in the Airport Catalog BC.
type AirportValidator interface {
	EnsureExists(ctx context.Context, airportID string) error
}

// PageQuery is offset pagination for list endpoints (API v1).
type PageQuery struct {
	Page     int
	PageSize int
}

// PageResult is a page of itineraries plus totals for clients.
type PageResult struct {
	Items    []Itinerary
	Total    int
	Page     int
	PageSize int
}

// Normalize clamps page/pageSize to safe defaults (page≥1, pageSize 1..100, default 20).
func (q PageQuery) Normalize() PageQuery {
	if q.Page < 1 {
		q.Page = 1
	}
	if q.PageSize < 1 {
		q.PageSize = 20
	}
	if q.PageSize > 100 {
		q.PageSize = 100
	}
	return q
}

func (q PageQuery) Offset() int {
	q = q.Normalize()
	return (q.Page - 1) * q.PageSize
}

// ItineraryRepository persists itineraries and outbox rows.
type ItineraryRepository interface {
	Create(ctx context.Context, itinerary Itinerary, outbox OutboxMessage) (Itinerary, error)
	Update(ctx context.Context, itinerary Itinerary) (Itinerary, error)
	Delete(ctx context.Context, id string) error
	GetByID(ctx context.Context, id string) (Itinerary, error)
	List(ctx context.Context) ([]Itinerary, error)
	ListPage(ctx context.Context, q PageQuery) (PageResult, error)
}

// OutboxMessage is an integration event pending reliable publication.
type OutboxMessage struct {
	ID            string
	AggregateType string
	AggregateID   string
	EventType     string
	Payload       []byte
	OccurredAt    time.Time
	Attempts      int
}

// OutboxStore reads/updates unpublished outbox rows for the relay worker.
type OutboxStore interface {
	ListUnpublished(ctx context.Context, limit int) ([]OutboxMessage, error)
	MarkPublished(ctx context.Context, id string, publishedAt time.Time) error
	BumpAttempts(ctx context.Context, id string) error
}

// EventPublisher publishes integration events to the broker (RabbitMQ).
type EventPublisher interface {
	Publish(ctx context.Context, routingKey string, messageID string, body []byte) error
	Close() error
}
