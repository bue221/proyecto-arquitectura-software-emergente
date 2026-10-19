package httpapi

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/codes"

	"github.com/bue221/personal-itineraries/services/airport-service/internal/application"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/domain"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/platform/logging"
)

type Handlers struct {
	GetAirport application.GetAirport
	ListMap    application.ListAirportsForMap
	Resilience func() map[string]any
	MetricsH   http.Handler
	Log        *slog.Logger
}

func (h Handlers) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h Handlers) Metrics(w http.ResponseWriter, r *http.Request) {
	if h.MetricsH == nil {
		http.NotFound(w, r)
		return
	}
	h.MetricsH.ServeHTTP(w, r)
}

func (h Handlers) ResilienceStatus(w http.ResponseWriter, r *http.Request) {
	if h.Resilience == nil {
		writeJSON(w, http.StatusOK, map[string]string{"status": "unavailable"})
		return
	}
	writeJSON(w, http.StatusOK, h.Resilience())
}

// DemoFail is a controlled failure for Jaeger / rubric demos (always 503 + error span).
func (h Handlers) DemoFail(w http.ResponseWriter, r *http.Request) {
	ctx, span := otel.Tracer("airport-service").Start(r.Context(), "demo.controlled_failure")
	defer span.End()

	err := errors.New("controlled failure for observability demo")
	span.RecordError(err)
	span.SetStatus(codes.Error, err.Error())

	traceID := logging.TraceIDFromContext(ctx)
	h.Log.Error("demo_controlled_failure", "trace_id", traceID)
	writeProblem(w, http.StatusServiceUnavailable, "demo_failure", "Controlled failure for Jaeger demo", traceID)
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
