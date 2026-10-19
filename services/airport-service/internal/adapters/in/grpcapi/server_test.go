package grpcapi_test

import (
	"context"
	"net"
	"testing"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/test/bufconn"

	airportv1 "github.com/bue221/personal-itineraries/packages/proto/gen/go/airport/v1"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/adapters/in/grpcapi"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/application"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/domain"
)

type fakeProvider struct {
	airport domain.Airport
	err     error
}

func (f fakeProvider) GetByID(ctx context.Context, id string) (domain.Airport, error) {
	if f.err != nil {
		return domain.Airport{}, f.err
	}
	return f.airport, nil
}

func (f fakeProvider) ListAll(ctx context.Context) ([]domain.Airport, error) {
	return nil, nil
}

func TestEnsureExists_OK(t *testing.T) {
	lis := bufconn.Listen(1024 * 1024)
	srv := grpc.NewServer()
	airportv1.RegisterAirportServiceServer(srv, &grpcapi.Server{
		GetAirport: application.GetAirport{Provider: fakeProvider{
			airport: domain.Airport{ID: "1", Name: "El Dorado", IATACode: "BOG"},
		}},
	})
	go func() { _ = srv.Serve(lis) }()
	t.Cleanup(srv.Stop)

	conn, err := grpc.NewClient("passthrough:///bufnet",
		grpc.WithContextDialer(func(ctx context.Context, s string) (net.Conn, error) {
			return lis.Dial()
		}),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = conn.Close() })

	client := airportv1.NewAirportServiceClient(conn)
	res, err := client.EnsureExists(context.Background(), &airportv1.EnsureExistsRequest{AirportId: "1"})
	if err != nil {
		t.Fatal(err)
	}
	if !res.Exists || res.IataCode != "BOG" {
		t.Fatalf("unexpected response: %+v", res)
	}
}

func TestEnsureExists_NotFound(t *testing.T) {
	lis := bufconn.Listen(1024 * 1024)
	srv := grpc.NewServer()
	airportv1.RegisterAirportServiceServer(srv, &grpcapi.Server{
		GetAirport: application.GetAirport{Provider: fakeProvider{err: domain.ErrNotFound}},
	})
	go func() { _ = srv.Serve(lis) }()
	t.Cleanup(srv.Stop)

	conn, err := grpc.NewClient("passthrough:///bufnet",
		grpc.WithContextDialer(func(ctx context.Context, s string) (net.Conn, error) {
			return lis.Dial()
		}),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = conn.Close() })

	client := airportv1.NewAirportServiceClient(conn)
	res, err := client.EnsureExists(context.Background(), &airportv1.EnsureExistsRequest{AirportId: "999"})
	if err != nil {
		t.Fatal(err)
	}
	if res.Exists {
		t.Fatal("expected exists=false")
	}
}
