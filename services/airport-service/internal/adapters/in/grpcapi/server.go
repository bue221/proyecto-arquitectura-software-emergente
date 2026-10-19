package grpcapi

import (
	"context"
	"errors"
	"log/slog"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	airportv1 "github.com/bue221/personal-itineraries/packages/proto/gen/go/airport/v1"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/application"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/domain"
)

// Server exposes Airport Catalog over gRPC (Level 3 S2S).
type Server struct {
	airportv1.UnimplementedAirportServiceServer
	GetAirport application.GetAirport
	Log        *slog.Logger
}

func (s *Server) EnsureExists(ctx context.Context, req *airportv1.EnsureExistsRequest) (*airportv1.EnsureExistsResponse, error) {
	if req == nil || req.GetAirportId() == "" {
		return nil, status.Error(codes.InvalidArgument, "airport_id is required")
	}

	airport, err := s.GetAirport.Execute(ctx, req.GetAirportId())
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrInvalidID):
			return nil, status.Error(codes.InvalidArgument, "invalid airport id")
		case errors.Is(err, domain.ErrNotFound):
			return &airportv1.EnsureExistsResponse{Exists: false}, nil
		case errors.Is(err, domain.ErrUpstreamUnavailable):
			if s.Log != nil {
				s.Log.Error("grpc_upstream_unavailable", "airport_id", req.GetAirportId(), "error", err.Error())
			}
			return nil, status.Error(codes.Unavailable, "airport provider unavailable")
		default:
			if s.Log != nil {
				s.Log.Error("grpc_ensure_exists_failed", "airport_id", req.GetAirportId(), "error", err.Error())
			}
			return nil, status.Error(codes.Internal, "unexpected error")
		}
	}

	return &airportv1.EnsureExistsResponse{
		Exists:   true,
		Id:       airport.ID,
		Name:     airport.Name,
		IataCode: airport.IATACode,
	}, nil
}
