package application

import (
	"context"
	"strings"

	"github.com/bue221/personal-itineraries/services/airport-service/internal/domain"
)

type GetAirport struct {
	Provider domain.AirportProvider
}

func (uc GetAirport) Execute(ctx context.Context, id string) (domain.Airport, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return domain.Airport{}, domain.ErrInvalidID
	}
	return uc.Provider.GetByID(ctx, id)
}
