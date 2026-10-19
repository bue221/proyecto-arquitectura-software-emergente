package application

import (
	"context"
	"encoding/json"
	"time"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
	"github.com/google/uuid"
)

type CreateItinerary struct {
	Repo      domain.ItineraryRepository
	Airports  domain.AirportValidator
	Now       func() time.Time
	NewID     func() string
}

type itineraryCreatedPayload struct {
	EventID              string `json:"eventId"`
	ItineraryID          string `json:"itineraryId"`
	UserName             string `json:"userName"`
	OriginAirportID      string `json:"originAirportId"`
	DestinationAirportID string `json:"destinationAirportId"`
	TravelDate           string `json:"travelDate"`
	DurationMinutes      int    `json:"durationMinutes"`
	OccurredAt           string `json:"occurredAt"`
}

func (uc CreateItinerary) Execute(ctx context.Context, cmd domain.CreateItineraryCommand) (domain.Itinerary, error) {
	if err := validateFields(cmd.UserName, cmd.OriginAirportID, cmd.DestinationAirportID, cmd.TravelDate, cmd.DurationMinutes); err != nil {
		return domain.Itinerary{}, err
	}
	if err := uc.Airports.EnsureExists(ctx, cmd.OriginAirportID); err != nil {
		return domain.Itinerary{}, err
	}
	if err := uc.Airports.EnsureExists(ctx, cmd.DestinationAirportID); err != nil {
		return domain.Itinerary{}, err
	}

	packing, err := normalizePacking(cmd.PackingItems)
	if err != nil {
		return domain.Itinerary{}, err
	}
	if len(packing) == 0 {
		packing = domain.DefaultPackingList()
	}

	now := uc.now()
	id := uc.newID()
	itinerary := domain.Itinerary{
		ID:                   id,
		UserName:             cmd.UserName,
		OriginAirportID:      cmd.OriginAirportID,
		DestinationAirportID: cmd.DestinationAirportID,
		TravelDate:           cmd.TravelDate.UTC().Truncate(24 * time.Hour),
		DurationMinutes:      cmd.DurationMinutes,
		PackingItems:         packing,
		CreatedAt:            now,
		UpdatedAt:            now,
	}

	eventID := uc.newID()
	payload, err := json.Marshal(itineraryCreatedPayload{
		EventID:              eventID,
		ItineraryID:          itinerary.ID,
		UserName:             itinerary.UserName,
		OriginAirportID:      itinerary.OriginAirportID,
		DestinationAirportID: itinerary.DestinationAirportID,
		TravelDate:           itinerary.TravelDate.Format("2006-01-02"),
		DurationMinutes:      itinerary.DurationMinutes,
		OccurredAt:           now.UTC().Format(time.RFC3339),
	})
	if err != nil {
		return domain.Itinerary{}, domain.ErrPersistenceFailed
	}

	outbox := domain.OutboxMessage{
		ID:            eventID,
		AggregateType: "itinerary",
		AggregateID:   itinerary.ID,
		EventType:     "ItineraryCreated",
		Payload:       payload,
		OccurredAt:    now,
	}

	return uc.Repo.Create(ctx, itinerary, outbox)
}

func (uc CreateItinerary) now() time.Time {
	if uc.Now != nil {
		return uc.Now().UTC()
	}
	return time.Now().UTC()
}

func (uc CreateItinerary) newID() string {
	if uc.NewID != nil {
		return uc.NewID()
	}
	return uuid.NewString()
}
