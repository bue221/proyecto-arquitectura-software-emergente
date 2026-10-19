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

type PlanItemDTO struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	Category    string `json:"category,omitempty"`
	Selected    bool   `json:"selected"`
	Source      string `json:"source,omitempty"`
}

type ItineraryRequest struct {
	UserName             string           `json:"userName"`
	OriginAirportID      string           `json:"originAirportId"`
	DestinationAirportID string           `json:"destinationAirportId"`
	TravelDate           string           `json:"travelDate"`
	DurationMinutes      int              `json:"durationMinutes"`
	PackingItems         []PackingItemDTO `json:"packingItems"`
	PlanItems            []PlanItemDTO    `json:"planItems"`
}

type ItineraryResponse struct {
	ID                   string           `json:"id"`
	UserName             string           `json:"userName"`
	OriginAirportID      string           `json:"originAirportId"`
	DestinationAirportID string           `json:"destinationAirportId"`
	TravelDate           string           `json:"travelDate"`
	DurationMinutes      int              `json:"durationMinutes"`
	PackingItems         []PackingItemDTO `json:"packingItems"`
	PlanItems            []PlanItemDTO    `json:"planItems"`
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
	plans := make([]PlanItemDTO, 0, len(i.PlanItems))
	for _, p := range i.PlanItems {
		plans = append(plans, PlanItemDTO{
			ID:          p.ID,
			Title:       p.Title,
			Description: p.Description,
			Category:    p.Category,
			Selected:    p.Selected,
			Source:      p.Source,
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
		PlanItems:            plans,
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

func toDomainPlans(items []PlanItemDTO) []domain.PlanItem {
	out := make([]domain.PlanItem, 0, len(items))
	for _, p := range items {
		out = append(out, domain.PlanItem{
			ID:          p.ID,
			Title:       p.Title,
			Description: p.Description,
			Category:    p.Category,
			Selected:    p.Selected,
			Source:      p.Source,
		})
	}
	return out
}

func parseTravelDate(raw string) (time.Time, error) {
	return time.Parse("2006-01-02", raw)
}
