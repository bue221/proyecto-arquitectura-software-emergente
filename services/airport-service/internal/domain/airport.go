package domain

// Airport is the internal catalog entity. External API schemas never leak here.
type Airport struct {
	ID       string
	Name     string
	IATACode string
	OACICode string
	Type     string
	City     string
	Lat      float64
	Lon      float64
}

// PlotlyPoint is a read model shaped for the map frontend.
type PlotlyPoint struct {
	ID   string  `json:"id"`
	Name string  `json:"name"`
	IATA string  `json:"iata"`
	Lat  float64 `json:"lat"`
	Lon  float64 `json:"lon"`
	Text string  `json:"text"`
}

func (a Airport) ToPlotlyPoint() PlotlyPoint {
	label := a.Name
	if a.IATACode != "" && a.IATACode != "N/A" {
		label = a.Name + " (" + a.IATACode + ")"
	}
	return PlotlyPoint{
		ID:   a.ID,
		Name: a.Name,
		IATA: a.IATACode,
		Lat:  a.Lat,
		Lon:  a.Lon,
		Text: label,
	}
}
