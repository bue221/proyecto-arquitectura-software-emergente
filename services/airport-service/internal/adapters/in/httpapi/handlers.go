package httpapi

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/bue221/personal-itineraries/services/airport-service/internal/application"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/domain"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/platform/logging"
)

type Handlers struct {
	GetAirport application.GetAirport
	ListMap    application.ListAirportsForMap
	Log        *slog.Logger
}

func (h Handlers) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h Handlers) GetByID(w http.ResponseWriter, r *http.Request) {
	traceID := logging.TraceIDFromContext(r.Context())
	id := r.PathValue("id")

	airport, err := h.GetAirport.Execute(r.Context(), id)
	if err != nil {
		h.writeDomainError(w, traceID, err)
		return
	}
	h.Log.Info("airport_fetched", "airport_id", airport.ID, "trace_id", traceID)
	writeJSON(w, http.StatusOK, toAirportResponse(airport))
}

func (h Handlers) ListForMap(w http.ResponseWriter, r *http.Request) {
	traceID := logging.TraceIDFromContext(r.Context())
	points, err := h.ListMap.Execute(r.Context())
	if err != nil {
		h.writeDomainError(w, traceID, err)
		return
	}
	h.Log.Info("airports_listed_for_map", "count", len(points), "trace_id", traceID)
	writeJSON(w, http.StatusOK, map[string]any{
		"count":  len(points),
		"points": points,
	})
}

func (h Handlers) writeDomainError(w http.ResponseWriter, traceID string, err error) {
	switch {
	case errors.Is(err, domain.ErrInvalidID):
		writeProblem(w, http.StatusBadRequest, "invalid_airport_id", "Airport id is invalid", traceID)
	case errors.Is(err, domain.ErrNotFound):
		writeProblem(w, http.StatusNotFound, "airport_not_found", "Airport was not found", traceID)
	case errors.Is(err, domain.ErrUpstreamUnavailable):
		h.Log.Error("upstream_unavailable", "error", err.Error(), "trace_id", traceID)
		writeProblem(w, http.StatusServiceUnavailable, "upstream_unavailable", "Airport provider is temporarily unavailable", traceID)
	default:
		h.Log.Error("internal_error", "error", err.Error(), "trace_id", traceID)
		writeProblem(w, http.StatusInternalServerError, "internal_error", "Unexpected server error", traceID)
	}
}

func writeProblem(w http.ResponseWriter, status int, code, message, traceID string) {
	writeJSON(w, status, Problem{Code: code, Message: message, TraceID: traceID})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
