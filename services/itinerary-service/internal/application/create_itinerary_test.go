package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
)

type fakeAirports struct {
	missing map[string]bool
	down    bool
}

func (f fakeAirports) EnsureExists(ctx context.Context, airportID string) error {
	if f.down {
		return domain.ErrAirportUnavailable
	}
	if f.missing[airportID] {
		return domain.ErrAirportInvalid
	}
	return nil
}

type fakeRepo struct {
	created domain.Itinerary
	outbox  domain.OutboxMessage
}

func (f *fakeRepo) Create(ctx context.Context, itinerary domain.Itinerary, outbox domain.OutboxMessage) (domain.Itinerary, error) {
	f.created = itinerary
	f.outbox = outbox
	return itinerary, nil
}
func (f *fakeRepo) Update(ctx context.Context, itinerary domain.Itinerary) (domain.Itinerary, error) {
	return itinerary, nil
}
func (f *fakeRepo) Delete(ctx context.Context, id string) error { return nil }
func (f *fakeRepo) GetByID(ctx context.Context, id string) (domain.Itinerary, error) {
	return domain.Itinerary{}, domain.ErrNotFound
}
func (f *fakeRepo) List(ctx context.Context) ([]domain.Itinerary, error) { return nil, nil }

func TestCreateItinerary_WritesOutbox(t *testing.T) {
	repo := &fakeRepo{}
	uc := CreateItinerary{
		Repo:     repo,
		Airports: fakeAirports{},
		Now:      func() time.Time { return time.Date(2026, 10, 19, 12, 0, 0, 0, time.UTC) },
		NewID: func() string {
			return "fixed-id"
		},
	}

	got, err := uc.Execute(context.Background(), domain.CreateItineraryCommand{
		UserName:             "Ana",
		OriginAirportID:      "1",
		DestinationAirportID: "2",
		TravelDate:           time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC),
		DurationMinutes:      90,
	})
	if err != nil {
		t.Fatal(err)
	}
	if got.ID != "fixed-id" {
		t.Fatalf("id=%s", got.ID)
	}
	if repo.outbox.EventType != "ItineraryCreated" {
		t.Fatalf("outbox event=%s", repo.outbox.EventType)
	}
}

func TestCreateItinerary_InvalidAirport(t *testing.T) {
	uc := CreateItinerary{
		Repo:     &fakeRepo{},
		Airports: fakeAirports{missing: map[string]bool{"9": true}},
	}
	_, err := uc.Execute(context.Background(), domain.CreateItineraryCommand{
		UserName:             "Ana",
		OriginAirportID:      "9",
		DestinationAirportID: "2",
		TravelDate:           time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC),
		DurationMinutes:      90,
	})
	if !errors.Is(err, domain.ErrAirportInvalid) {
		t.Fatalf("got %v", err)
	}
}
