package application

import (
	"context"
	"time"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
)

type UpdateItinerary struct {
	Repo     domain.ItineraryRepository
	Airports domain.AirportValidator
	Now      func() time.Time
}

func (uc UpdateItinerary) Execute(ctx context.Context, cmd domain.UpdateItineraryCommand) (domain.Itinerary, error) {
	if cmd.ID == "" {
		return domain.Itinerary{}, domain.ErrInvalidInput
	}
	if err := validateFields(cmd.UserName, cmd.OriginAirportID, cmd.DestinationAirportID, cmd.TravelDate, cmd.DurationMinutes); err != nil {
		return domain.Itinerary{}, err
	}

	existing, err := uc.Repo.GetByID(ctx, cmd.ID)
	if err != nil {
		return domain.Itinerary{}, err
	}

	if err := uc.Airports.EnsureExists(ctx, cmd.OriginAirportID); err != nil {
		return domain.Itinerary{}, err
	}
	if err := uc.Airports.EnsureExists(ctx, cmd.DestinationAirportID); err != nil {
		return domain.Itinerary{}, err
	}

	now := time.Now().UTC()
	if uc.Now != nil {
		now = uc.Now().UTC()
	}

	packing, err := normalizePacking(cmd.PackingItems)
	if err != nil {
		return domain.Itinerary{}, err
	}
	plans, err := normalizePlans(cmd.PlanItems)
	if err != nil {
		return domain.Itinerary{}, err
	}

	existing.UserName = cmd.UserName
	existing.OriginAirportID = cmd.OriginAirportID
	existing.DestinationAirportID = cmd.DestinationAirportID
	existing.TravelDate = cmd.TravelDate.UTC().Truncate(24 * time.Hour)
	existing.DurationMinutes = cmd.DurationMinutes
	existing.PackingItems = packing
	existing.PlanItems = plans
	existing.UpdatedAt = now

	return uc.Repo.Update(ctx, existing)
}
