package application

import (
	"strings"
	"time"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
)

func validateFields(userName, originID, destinationID string, travelDate time.Time, durationMinutes int) error {
	if strings.TrimSpace(userName) == "" {
		return domain.ErrInvalidInput
	}
	if strings.TrimSpace(originID) == "" || strings.TrimSpace(destinationID) == "" {
		return domain.ErrInvalidInput
	}
	if originID == destinationID {
		return domain.ErrInvalidInput
	}
	if travelDate.IsZero() {
		return domain.ErrInvalidInput
	}
	if durationMinutes <= 0 {
		return domain.ErrInvalidInput
	}
	return nil
}
