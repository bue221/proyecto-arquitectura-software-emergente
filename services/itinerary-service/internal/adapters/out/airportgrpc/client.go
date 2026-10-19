package airportgrpc

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	airportv1 "github.com/bue221/personal-itineraries/packages/proto/gen/go/airport/v1"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
)

// Client validates airports via Airport Service gRPC (Level 3).
type Client struct {
	conn   *grpc.ClientConn
	client airportv1.AirportServiceClient
}

func Dial(target string, timeout time.Duration) (*Client, error) {
	if timeout <= 0 {
		timeout = 5 * time.Second
	}
	_ = timeout // reserved for future dial deadline / keepalive tuning

	conn, err := grpc.NewClient(target,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		return nil, fmt.Errorf("airport grpc dial: %w", err)
	}
	return &Client{
		conn:   conn,
		client: airportv1.NewAirportServiceClient(conn),
	}, nil
}

func (c *Client) EnsureExists(ctx context.Context, airportID string) error {
	res, err := c.client.EnsureExists(ctx, &airportv1.EnsureExistsRequest{AirportId: airportID})
	if err != nil {
		return fmt.Errorf("%w: %v", domain.ErrAirportUnavailable, err)
	}
	if !res.GetExists() {
		return domain.ErrAirportInvalid
	}
	return nil
}

func (c *Client) Close() error {
	if c == nil || c.conn == nil {
		return nil
	}
	return c.conn.Close()
}
