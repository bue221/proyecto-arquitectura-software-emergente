package domain

import "errors"

var (
	ErrInvalidInput         = errors.New("invalid itinerary input")
	ErrNotFound             = errors.New("itinerary not found")
	ErrAirportInvalid       = errors.New("airport reference is invalid")
	ErrAirportUnavailable   = errors.New("airport service unavailable")
	ErrPersistenceFailed    = errors.New("itinerary persistence failed")
)
