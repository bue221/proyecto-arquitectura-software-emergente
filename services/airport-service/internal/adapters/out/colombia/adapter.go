package colombia

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"strconv"
	"time"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"

	"github.com/bue221/personal-itineraries/services/airport-service/internal/adapters/out/resilience"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/domain"
)

const defaultBaseURL = "https://api-colombia.com"

// Adapter translates API Colombia responses into domain.Airport (anti-corruption layer).
type Adapter struct {
	baseURL    string
	httpClient *http.Client
	cache      domain.AirportCache
	breaker    *resilience.Breaker
	retry      resilience.RetryConfig
	listKey    string
}

func NewAdapter(baseURL string, timeout time.Duration, cache domain.AirportCache, breaker *resilience.Breaker) *Adapter {
	if baseURL == "" {
		baseURL = defaultBaseURL
	}
	if timeout <= 0 {
		timeout = 8 * time.Second
	}
	if breaker == nil {
		breaker = resilience.NewBreaker(5, 30*time.Second)
	}
	return &Adapter{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout:   timeout,
			Transport: otelhttp.NewTransport(http.DefaultTransport),
		},
		cache:   cache,
		breaker: breaker,
		retry:   resilience.DefaultRetry(),
		listKey: "airports:list:v1",
	}
}

func (a *Adapter) BreakerSnapshot() map[string]any {
	return a.breaker.Snapshot()
}

type externalAirport struct {
	ID        int     `json:"id"`
	Name      string  `json:"name"`
	IATACode  string  `json:"iataCode"`
	OACICode  string  `json:"oaciCode"`
	Type      string  `json:"type"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	City      *struct {
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
	var airport domain.Airport
	err := a.withResilience(ctx, func(ctx context.Context) error {
		body, status, err := a.get(ctx, url, 1<<20)
		if err != nil {
			return err
		}
		switch status {
		case http.StatusOK:
			var ext externalAirport
			if err := json.Unmarshal(body, &ext); err != nil {
				return fmt.Errorf("%w: decode: %v", domain.ErrUpstreamUnavailable, err)
			}
			airport = mapExternal(ext)
			a.storeCache(ctx, cacheKey, airport)
			return nil
		case http.StatusNotFound:
			return domain.ErrNotFound
		default:
			return fmt.Errorf("%w: status %d", domain.ErrUpstreamUnavailable, status)
		}
	})
	if err != nil {
		return domain.Airport{}, err
	}
	return airport, nil
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
	var airports []domain.Airport
	err := a.withResilience(ctx, func(ctx context.Context) error {
		body, status, err := a.get(ctx, url, 8<<20)
		if err != nil {
			return err
		}
		if status != http.StatusOK {
			return fmt.Errorf("%w: status %d", domain.ErrUpstreamUnavailable, status)
		}
		var ext []externalAirport
		if err := json.Unmarshal(body, &ext); err != nil {
			return fmt.Errorf("%w: decode: %v", domain.ErrUpstreamUnavailable, err)
		}
		airports = make([]domain.Airport, 0, len(ext))
		for _, item := range ext {
			airports = append(airports, mapExternal(item))
		}
		a.storeCache(ctx, a.listKey, airports)
		return nil
	})
	if err != nil {
		return nil, err
	}
	return airports, nil
}

func (a *Adapter) withResilience(ctx context.Context, fn func(context.Context) error) error {
	if err := a.breaker.Allow(); err != nil {
		return fmt.Errorf("%w: %v", domain.ErrUpstreamUnavailable, err)
	}

	err := resilience.Do(ctx, a.retry, func(ctx context.Context) error {
		callErr := fn(ctx)
		if callErr == nil || errors.Is(callErr, domain.ErrNotFound) || errors.Is(callErr, domain.ErrInvalidID) {
			return callErr
		}
		return callErr
	})

	if err == nil || errors.Is(err, domain.ErrNotFound) || errors.Is(err, domain.ErrInvalidID) {
		a.breaker.Success()
		return err
	}
	a.breaker.Failure()
	if errors.Is(err, resilience.ErrOpen) {
		return fmt.Errorf("%w: circuit open", domain.ErrUpstreamUnavailable)
	}
	return err
}

func (a *Adapter) get(ctx context.Context, url string, limit int64) ([]byte, int, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, 0, fmt.Errorf("%w: build request: %v", domain.ErrUpstreamUnavailable, err)
	}
	res, err := a.httpClient.Do(req)
	if err != nil {
		return nil, 0, fmt.Errorf("%w: %v", domain.ErrUpstreamUnavailable, err)
	}
	defer res.Body.Close()
	body, err := io.ReadAll(io.LimitReader(res.Body, limit))
	if err != nil {
		return nil, res.StatusCode, fmt.Errorf("%w: read body: %v", domain.ErrUpstreamUnavailable, err)
	}
	return body, res.StatusCode, nil
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

func normalizeCoordinates(rawLat, rawLon float64) (lat, lon float64) {
	lat, lon = rawLat, rawLon
	inLatBand := func(v float64) bool { return v >= -5 && v <= 14 }
	inLonBand := func(v float64) bool { return v <= -66 && v >= -82 }

	if !inLatBand(lat) && inLatBand(lon) && (inLonBand(lat) || math.Abs(lat) > 20) {
		return lon, lat
	}
	return lat, lon
}
