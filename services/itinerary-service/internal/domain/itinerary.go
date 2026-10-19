package domain

import "time"

// PackingItem is one checklist row for what to bring on the trip.
type PackingItem struct {
	ID      string `json:"id"`
	Label   string `json:"label"`
	Packed  bool   `json:"packed"`
	Category string `json:"category,omitempty"`
}

// Itinerary is the aggregate root for personal trip planning.
type Itinerary struct {
	ID                   string
	UserName             string
	OriginAirportID      string
	DestinationAirportID string
	TravelDate           time.Time
	DurationMinutes      int
	PackingItems         []PackingItem
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
	PackingItems         []PackingItem
}

// UpdateItineraryCommand updates mutable fields of an existing itinerary.
type UpdateItineraryCommand struct {
	ID                   string
	UserName             string
	OriginAirportID      string
	DestinationAirportID string
	TravelDate           time.Time
	DurationMinutes      int
	PackingItems         []PackingItem
}

// DefaultPackingList seeds a practical Colombia domestic-trip checklist.
func DefaultPackingList() []PackingItem {
	return []PackingItem{
		{ID: "pack-id", Label: "Documento de identidad", Category: "docs", Packed: false},
		{ID: "pack-ticket", Label: "Boarding pass / reserva", Category: "docs", Packed: false},
		{ID: "pack-charger", Label: "Cargador de celular", Category: "tech", Packed: false},
		{ID: "pack-earphones", Label: "Audífonos", Category: "tech", Packed: false},
		{ID: "pack-clothes", Label: "Cambio de ropa", Category: "clothes", Packed: false},
		{ID: "pack-toiletry", Label: "Kit de aseo", Category: "personal", Packed: false},
		{ID: "pack-meds", Label: "Medicamentos", Category: "personal", Packed: false},
		{ID: "pack-cash", Label: "Efectivo / tarjeta", Category: "money", Packed: false},
	}
}
