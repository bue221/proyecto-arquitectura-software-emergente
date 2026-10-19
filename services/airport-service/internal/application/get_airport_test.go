package application

import (
	"context"
	"errors"
	"testing"

	"github.com/bue221/personal-itineraries/services/airport-service/internal/domain"
)

type fakeProvider struct {
	airport domain.Airport
	err     error
}

func (f fakeProvider) GetByID(ctx context.Context, id string) (domain.Airport, error) {
	if f.err != nil {
		return domain.Airport{}, f.err
	}
	return f.airport, nil
}

func (f fakeProvider) ListAll(ctx context.Context) ([]domain.Airport, error) {
	return nil, errors.New("not implemented")
}

func TestGetAirport_EmptyID(t *testing.T) {
	uc := GetAirport{Provider: fakeProvider{}}
	_, err := uc.Execute(context.Background(), "  ")
	if !errors.Is(err, domain.ErrInvalidID) {
		t.Fatalf("expected ErrInvalidID, got %v", err)
	}
}

func TestGetAirport_OK(t *testing.T) {
	uc := GetAirport{Provider: fakeProvider{airport: domain.Airport{ID: "1", Name: "Eden"}}}
	got, err := uc.Execute(context.Background(), "1")
	if err != nil {
		t.Fatal(err)
	}
	if got.Name != "Eden" {
		t.Fatalf("unexpected name %q", got.Name)
	}
}
