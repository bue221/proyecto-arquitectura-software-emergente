package colombia

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/bue221/personal-itineraries/services/airport-service/internal/domain"
)

const defaultBaseURL = "https://api-colombia.com"

// Adapter translates API Colombia responses into domain.Airport (anti-corruption layer).
type Adapter struct {
	baseURL    string
	httpClient *http.Client
	cache      domain.AirportCache
	listKey    string
}

func NewAdapter(baseURL string, timeout time.Duration, cache domain.AirportCache) *Adapter {
	if baseURL == "" {
		baseURL = defaultBaseURL
	}
	if timeout <= 0 {
		timeout = 8 * time.Second
	}
	return &Adapter{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: timeout,
		},
		cache:   cache,
		listKey: "airports:list:v1",
	}
}

type externalAirport struct {
	ID         int     `json:"id"`
	Name       string  `json:"name"`
	IATACode   string  `json:"iataCode"`
	OACICode   string  `json:"oaciCode"`
	Type       string  `json:"type"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	City       *struct {
		Name string `json:"name"`
	} `json:"city"`
}

func (a *Adapter) GetByID(ctx context.Context, id string) (domain.Airport, error) {
	if _, err := strconv.Atoi(id); err != nil {
		return domain.Airport{}, domain.ErrInvalidID
	}

	cacheKey := "airports:id:" + id
	if a.cache != nil {
		if raw, ok, err := a.cache.Get(ctx, cacheKey); err == nil && ok {
			var airport domain.Airport
			if err := json.Unmarshal(raw, &airport); err == nil {
				return airport, nil
			}
		}
	}

	url := fmt.Sprintf("%s/api/v1/Airport/%s", a.baseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return domain.Airport{}, fmt.Errorf("%w: build request: %v", domain.ErrUpstreamUnavailable, err)
	}

	res, err := a.httpClient.Do(req)
	if err != nil {
		return domain.Airport{}, fmt.Errorf("%w: %v", domain.ErrUpstreamUnavailable, err)
	}
	defer res.Body.Close()

	body, err := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if err != nil {
		return domain.Airport{}, fmt.Errorf("%w: read body: %v", domain.ErrUpstreamUnavailable, err)
	}

	switch res.StatusCode {
	case http.StatusOK:
		var ext externalAirport
		if err := json.Unmarshal(body, &ext); err != nil {
			return domain.Airport{}, fmt.Errorf("%w: decode: %v", domain.ErrUpstreamUnavailable, err)
		}
		airport := mapExternal(ext)
		a.storeCache(ctx, cacheKey, airport)
		return airport, nil
	case http.StatusNotFound:
		return domain.Airport{}, domain.ErrNotFound
	default:
		return domain.Airport{}, fmt.Errorf("%w: status %d", domain.ErrUpstreamUnavailable, res.StatusCode)
	}
}

func (a *Adapter) ListAll(ctx context.Context) ([]domain.Airport, error) {
	if a.cache != nil {
		if raw, ok, err := a.cache.Get(ctx, a.listKey); err == nil && ok {
			var airports []domain.Airport
			if err := json.Unmarshal(raw, &airports); err == nil {
				return airports, nil
			}
		}
	}

	url := a.baseURL + "/api/v1/Airport"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("%w: build request: %v", domain.ErrUpstreamUnavailable, err)
	}

	res, err := a.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", domain.ErrUpstreamUnavailable, err)
	}
	defer res.Body.Close()

	body, err := io.ReadAll(io.LimitReader(res.Body, 8<<20))
	if err != nil {
		return nil, fmt.Errorf("%w: read body: %v", domain.ErrUpstreamUnavailable, err)
	}
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("%w: status %d", domain.ErrUpstreamUnavailable, res.StatusCode)
	}

	var ext []externalAirport
	if err := json.Unmarshal(body, &ext); err != nil {
		return nil, fmt.Errorf("%w: decode: %v", domain.ErrUpstreamUnavailable, err)
	}

	airports := make([]domain.Airport, 0, len(ext))
	for _, item := range ext {
		airports = append(airports, mapExternal(item))
	}
	a.storeCache(ctx, a.listKey, airports)
	return airports, nil
}

func (a *Adapter) storeCache(ctx context.Context, key string, value any) {
	if a.cache == nil {
		return
	}
	raw, err := json.Marshal(value)
	if err != nil {
		return
	}
	_ = a.cache.Set(ctx, key, raw)
}

func mapExternal(ext externalAirport) domain.Airport {
	lat, lon := normalizeCoordinates(ext.Latitude, ext.Longitude)
	city := ""
	if ext.City != nil {
		city = ext.City.Name
	}
	return domain.Airport{
		ID:       strconv.Itoa(ext.ID),
		Name:     ext.Name,
		IATACode: ext.IATACode,
		OACICode: ext.OACICode,
		Type:     ext.Type,
		City:     city,
		Lat:      lat,
		Lon:      lon,
	}
}

// normalizeCoordinates fixes API Colombia quirk where lat/lon are often swapped.
func normalizeCoordinates(rawLat, rawLon float64) (lat, lon float64) {
	lat, lon = rawLat, rawLon
	// Colombia roughly: lat [-5, 14], lon [-82, -66]
	inLatBand := func(v float64) bool { return v >= -5 && v <= 14 }
	inLonBand := func(v float64) bool { return v <= -66 && v >= -82 }

	if !inLatBand(lat) && inLatBand(lon) && (inLonBand(lat) || math.Abs(lat) > 20) {
		return lon, lat
	}
	return lat, lon
}
