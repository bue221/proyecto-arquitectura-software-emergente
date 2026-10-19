package application

import (
	"context"
	"testing"
	"time"

	"github.com/bue221/personal-itineraries/services/notification-function/internal/domain"
)

type fakeRepo struct {
	seen     map[string]bool
	inserted int
}

func (f *fakeRepo) SaveIdempotent(ctx context.Context, record domain.NotificationRecord) (bool, error) {
	if f.seen == nil {
		f.seen = map[string]bool{}
	}
	if f.seen[record.EventID] {
		return false, nil
	}
	f.seen[record.EventID] = true
	f.inserted++
	return true, nil
}

func TestSendNotification_Idempotent(t *testing.T) {
	repo := &fakeRepo{}
	fn := SendNotificationFunction{
		Repo:  repo,
		Now:   func() time.Time { return time.Date(2026, 10, 19, 12, 0, 0, 0, time.UTC) },
		NewID: func() string { return "n-1" },
	}
	payload := []byte(`{
		"eventId":"e-1",
		"itineraryId":"i-1",
		"userName":"Ana",
		"originAirportId":"1",
		"destinationAirportId":"2",
		"travelDate":"2026-12-01",
		"durationMinutes":90,
		"occurredAt":"2026-10-19T12:00:00Z"
	}`)

	if err := fn.Handle(context.Background(), payload); err != nil {
		t.Fatal(err)
	}
	if err := fn.Handle(context.Background(), payload); err != nil {
		t.Fatal(err)
	}
	if repo.inserted != 1 {
		t.Fatalf("inserted=%d want 1", repo.inserted)
	}
}
