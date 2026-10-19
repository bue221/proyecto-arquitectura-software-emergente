package airportgrpc

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc"

	airportv1 "github.com/bue221/personal-itineraries/packages/proto/gen/go/airport/v1"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/platform/grpctls"
)

// Client validates airports via Airport Service gRPC (Level 3).
type Client struct {
	conn   *grpc.ClientConn
	client airportv1.AirportServiceClient
}

// DialOptions configure optional mTLS for S2S calls.
type DialOptions struct {
	Timeout    time.Duration
	MTLS       bool
	CertFile   string
	KeyFile    string
	CAFile     string
	ServerName string
}

func Dial(target string, timeout time.Duration) (*Client, error) {
	return DialWith(target, DialOptions{Timeout: timeout})
}

func DialWith(target string, opts DialOptions) (*Client, error) {
	if opts.Timeout <= 0 {
		opts.Timeout = 5 * time.Second
	}
	_ = opts.Timeout // reserved for future dial deadline / keepalive tuning

	creds, err := grpctls.ClientCredentials(opts.MTLS, opts.CertFile, opts.KeyFile, opts.CAFile, opts.ServerName)
	if err != nil {
		return nil, err
	}
	conn, err := grpc.NewClient(target, grpc.WithTransportCredentials(creds))
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
