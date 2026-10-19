package domain

import "context"

// AirportProvider is the inbound port for catalog data (implemented by adapters).
type AirportProvider interface {
	GetByID(ctx context.Context, id string) (Airport, error)
	ListAll(ctx context.Context) ([]Airport, error)
}

// AirportCache stores adapted payloads to reduce upstream calls.
type AirportCache interface {
	Get(ctx context.Context, key string) ([]byte, bool, error)
	Set(ctx context.Context, key string, value []byte) error
}
