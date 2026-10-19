package application

import (
	"context"
	"strings"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
)

type GetItinerary struct {
	Repo domain.ItineraryRepository
}

func (uc GetItinerary) Execute(ctx context.Context, id string) (domain.Itinerary, error) {
	if strings.TrimSpace(id) == "" {
		return domain.Itinerary{}, domain.ErrInvalidInput
	}
	return uc.Repo.GetByID(ctx, id)
}

type ListItineraries struct {
	Repo domain.ItineraryRepository
}

func (uc ListItineraries) Execute(ctx context.Context) ([]domain.Itinerary, error) {
	return uc.Repo.List(ctx)
}

func (uc ListItineraries) ExecutePage(ctx context.Context, q domain.PageQuery) (domain.PageResult, error) {
	return uc.Repo.ListPage(ctx, q.Normalize())
}

type DeleteItinerary struct {
	Repo domain.ItineraryRepository
}

func (uc DeleteItinerary) Execute(ctx context.Context, id string) error {
	if strings.TrimSpace(id) == "" {
		return domain.ErrInvalidInput
	}
	return uc.Repo.Delete(ctx, id)
}
