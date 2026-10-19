package application

import (
	"strings"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
	"github.com/google/uuid"
)

const maxPackingItems = 40

func normalizePacking(items []domain.PackingItem) ([]domain.PackingItem, error) {
	if items == nil {
		return []domain.PackingItem{}, nil
	}
	if len(items) > maxPackingItems {
		return nil, domain.ErrInvalidInput
	}
	out := make([]domain.PackingItem, 0, len(items))
	for _, item := range items {
		label := strings.TrimSpace(item.Label)
		if label == "" {
			continue
		}
		if len(label) > 80 {
			return nil, domain.ErrInvalidInput
		}
		id := strings.TrimSpace(item.ID)
		if id == "" {
			id = uuid.NewString()
		}
		category := strings.TrimSpace(item.Category)
		if len(category) > 32 {
			category = category[:32]
		}
		out = append(out, domain.PackingItem{
			ID:       id,
			Label:    label,
			Packed:   item.Packed,
			Category: category,
		})
	}
	return out, nil
}
