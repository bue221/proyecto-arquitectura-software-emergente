package airporthttp

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/platform/logging"
)

// Client validates airports against Airport Service over HTTP.
type Client struct {
	baseURL    string
	httpClient *http.Client
}

func New(baseURL string, timeout time.Duration) *Client {
	baseURL = strings.TrimRight(baseURL, "/")
	if timeout <= 0 {
		timeout = 5 * time.Second
	}
	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout:   timeout,
			Transport: otelhttp.NewTransport(http.DefaultTransport),
		},
	}
}

func (c *Client) EnsureExists(ctx context.Context, airportID string) error {
	url := fmt.Sprintf("%s/api/v1/airports/%s", c.baseURL, airportID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return fmt.Errorf("%w: build request: %v", domain.ErrAirportUnavailable, err)
	}
	if trace := logging.TraceIDFromContext(ctx); trace != "" {
		req.Header.Set("X-Trace-Id", trace)
	}

	res, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("%w: %v", domain.ErrAirportUnavailable, err)
	}
	defer res.Body.Close()
	_, _ = io.Copy(io.Discard, io.LimitReader(res.Body, 1<<20))

	switch res.StatusCode {
	case http.StatusOK:
		return nil
	case http.StatusNotFound, http.StatusBadRequest:
		return domain.ErrAirportInvalid
	default:
		return fmt.Errorf("%w: status %d", domain.ErrAirportUnavailable, res.StatusCode)
	}
}
