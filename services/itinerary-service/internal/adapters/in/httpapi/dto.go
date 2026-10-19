package httpapi

import (
	"time"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
)

type PackingItemDTO struct {
	ID       string `json:"id"`
	Label    string `json:"label"`
	Packed   bool   `json:"packed"`
	Category string `json:"category,omitempty"`
}

type ItineraryRequest struct {
	UserName             string           `json:"userName"`
	OriginAirportID      string           `json:"originAirportId"`
	DestinationAirportID string           `json:"destinationAirportId"`
	TravelDate           string           `json:"travelDate"`
	DurationMinutes      int              `json:"durationMinutes"`
	PackingItems         []PackingItemDTO `json:"packingItems"`
}

type ItineraryResponse struct {
	ID                   string           `json:"id"`
	UserName             string           `json:"userName"`
	OriginAirportID      string           `json:"originAirportId"`
	DestinationAirportID string           `json:"destinationAirportId"`
	TravelDate           string           `json:"travelDate"`
	DurationMinutes      int              `json:"durationMinutes"`
	PackingItems         []PackingItemDTO `json:"packingItems"`
	CreatedAt            string           `json:"createdAt"`
	UpdatedAt            string           `json:"updatedAt"`
}

type Problem struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	TraceID string `json:"trace_id,omitempty"`
}

func toResponse(i domain.Itinerary) ItineraryResponse {
	items := make([]PackingItemDTO, 0, len(i.PackingItems))
	for _, p := range i.PackingItems {
		items = append(items, PackingItemDTO{
			ID:       p.ID,
			Label:    p.Label,
			Packed:   p.Packed,
			Category: p.Category,
		})
	}
	return ItineraryResponse{
		ID:                   i.ID,
		UserName:             i.UserName,
		OriginAirportID:      i.OriginAirportID,
		DestinationAirportID: i.DestinationAirportID,
		TravelDate:           i.TravelDate.Format("2006-01-02"),
		DurationMinutes:      i.DurationMinutes,
		PackingItems:         items,
		CreatedAt:            i.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:            i.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func toDomainPacking(items []PackingItemDTO) []domain.PackingItem {
	out := make([]domain.PackingItem, 0, len(items))
	for _, p := range items {
		out = append(out, domain.PackingItem{
			ID:       p.ID,
			Label:    p.Label,
			Packed:   p.Packed,
			Category: p.Category,
		})
	}
	return out
}

func parseTravelDate(raw string) (time.Time, error) {
	return time.Parse("2006-01-02", raw)
}
