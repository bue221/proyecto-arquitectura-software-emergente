package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
)

type fakeOutboxStore struct {
	rows      []domain.OutboxMessage
	published []string
	bumped    []string
}

func (f *fakeOutboxStore) ListUnpublished(ctx context.Context, limit int) ([]domain.OutboxMessage, error) {
	if len(f.rows) > limit {
		return f.rows[:limit], nil
	}
	return f.rows, nil
}

func (f *fakeOutboxStore) MarkPublished(ctx context.Context, id string, publishedAt time.Time) error {
	f.published = append(f.published, id)
	remaining := f.rows[:0]
	for _, r := range f.rows {
		if r.ID != id {
			remaining = append(remaining, r)
		}
	}
	f.rows = remaining
	return nil
}

func (f *fakeOutboxStore) BumpAttempts(ctx context.Context, id string) error {
	f.bumped = append(f.bumped, id)
	return nil
}

type fakePublisher struct {
	calls []string
	err   error
}

func (f *fakePublisher) Publish(ctx context.Context, routingKey string, messageID string, body []byte) error {
	f.calls = append(f.calls, routingKey+":"+messageID)
	return f.err
}

func (f *fakePublisher) Close() error { return nil }

func TestOutboxRelay_PublishesAndMarks(t *testing.T) {
	store := &fakeOutboxStore{
		rows: []domain.OutboxMessage{{
			ID:        "evt-1",
			EventType: "ItineraryCreated",
			Payload:   []byte(`{"eventId":"evt-1"}`),
		}},
	}
	pub := &fakePublisher{}
	relay := OutboxRelay{Store: store, Publisher: pub}

	if err := relay.DrainOnce(context.Background(), 10); err != nil {
		t.Fatal(err)
	}
	if len(pub.calls) != 1 || pub.calls[0] != "itinerary.created:evt-1" {
		t.Fatalf("publish calls=%v", pub.calls)
	}
	if len(store.published) != 1 || store.published[0] != "evt-1" {
		t.Fatalf("published=%v", store.published)
	}
}

func TestOutboxRelay_BumpOnPublishError(t *testing.T) {
	store := &fakeOutboxStore{
		rows: []domain.OutboxMessage{{
			ID:        "evt-2",
			EventType: "ItineraryCreated",
			Payload:   []byte(`{}`),
		}},
	}
	pub := &fakePublisher{err: errors.New("broker down")}
	relay := OutboxRelay{Store: store, Publisher: pub}

	if err := relay.DrainOnce(context.Background(), 10); err != nil {
		t.Fatal(err)
	}
	if len(store.published) != 0 {
		t.Fatalf("should not mark published")
	}
	if len(store.bumped) != 1 {
		t.Fatalf("expected bump, got %v", store.bumped)
	}
}
