package httpapi

import "github.com/bue221/personal-itineraries/services/airport-service/internal/domain"

type AirportResponse struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	IATACode string  `json:"iataCode"`
	OACICode string  `json:"oaciCode"`
	Type     string  `json:"type"`
	City     string  `json:"city,omitempty"`
	Lat      float64 `json:"lat"`
	Lon      float64 `json:"lon"`
}

type Problem struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	TraceID string `json:"trace_id,omitempty"`
}

func toAirportResponse(a domain.Airport) AirportResponse {
	return AirportResponse{
		ID:       a.ID,
		Name:     a.Name,
		IATACode: a.IATACode,
		OACICode: a.OACICode,
		Type:     a.Type,
		City:     a.City,
		Lat:      a.Lat,
		Lon:      a.Lon,
	}
}
