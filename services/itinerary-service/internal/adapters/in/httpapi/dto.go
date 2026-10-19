package httpapi

import (
	"time"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
)

type ItineraryRequest struct {
	UserName             string `json:"userName"`
	OriginAirportID      string `json:"originAirportId"`
	DestinationAirportID string `json:"destinationAirportId"`
	TravelDate           string `json:"travelDate"`
	DurationMinutes      int    `json:"durationMinutes"`
}

type ItineraryResponse struct {
	ID                   string `json:"id"`
	UserName             string `json:"userName"`
	OriginAirportID      string `json:"originAirportId"`
	DestinationAirportID string `json:"destinationAirportId"`
	TravelDate           string `json:"travelDate"`
	DurationMinutes      int    `json:"durationMinutes"`
	CreatedAt            string `json:"createdAt"`
	UpdatedAt            string `json:"updatedAt"`
}

type Problem struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	TraceID string `json:"trace_id,omitempty"`
}

func toResponse(i domain.Itinerary) ItineraryResponse {
	return ItineraryResponse{
		ID:                   i.ID,
		UserName:             i.UserName,
		OriginAirportID:      i.OriginAirportID,
		DestinationAirportID: i.DestinationAirportID,
		TravelDate:           i.TravelDate.Format("2006-01-02"),
		DurationMinutes:      i.DurationMinutes,
		CreatedAt:            i.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:            i.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func parseTravelDate(raw string) (time.Time, error) {
	return time.Parse("2006-01-02", raw)
}
