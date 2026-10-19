package application

import (
	"context"

	"github.com/bue221/personal-itineraries/services/airport-service/internal/domain"
)

type ListAirportsForMap struct {
	Provider domain.AirportProvider
}

func (uc ListAirportsForMap) Execute(ctx context.Context) ([]domain.PlotlyPoint, error) {
	airports, err := uc.Provider.ListAll(ctx)
	if err != nil {
		return nil, err
	}

	points := make([]domain.PlotlyPoint, 0, len(airports))
	for _, a := range airports {
		// Skip entries without usable coordinates.
		if a.Lat == 0 && a.Lon == 0 {
			continue
		}
		points = append(points, a.ToPlotlyPoint())
	}
	return points, nil
}
