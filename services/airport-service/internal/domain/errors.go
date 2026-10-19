package domain

import "errors"

var (
	ErrNotFound           = errors.New("airport not found")
	ErrInvalidID          = errors.New("invalid airport id")
	ErrUpstreamUnavailable = errors.New("upstream airport provider unavailable")
)
