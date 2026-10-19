package domain

import "time"

// Itinerary is the aggregate root for personal trip planning.
type Itinerary struct {
	ID                   string
	UserName             string
	OriginAirportID      string
	DestinationAirportID string
	TravelDate           time.Time
	DurationMinutes      int
	CreatedAt            time.Time
	UpdatedAt            time.Time
}

// CreateItineraryCommand carries validated write intent from the application edge.
type CreateItineraryCommand struct {
	UserName             string
	OriginAirportID      string
	DestinationAirportID string
	TravelDate           time.Time
	DurationMinutes      int
}

// UpdateItineraryCommand updates mutable fields of an existing itinerary.
type UpdateItineraryCommand struct {
	ID                   string
	UserName             string
	OriginAirportID      string
	DestinationAirportID string
	TravelDate           time.Time
	DurationMinutes      int
}
