package httpapi

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/application"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/platform/logging"
)

type Handlers struct {
	CreateUC application.CreateItinerary
	UpdateUC application.UpdateItinerary
	GetUC    application.GetItinerary
	ListUC   application.ListItineraries
	DeleteUC application.DeleteItinerary
	Log      *slog.Logger
}

func (h Handlers) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h Handlers) Create(w http.ResponseWriter, r *http.Request) {
	traceID := logging.TraceIDFromContext(r.Context())
	var req ItineraryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeProblem(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON", traceID)
		return
	}
	travelDate, err := parseTravelDate(req.TravelDate)
	if err != nil {
		writeProblem(w, http.StatusBadRequest, "invalid_travel_date", "travelDate must use YYYY-MM-DD", traceID)
		return
	}

	created, err := h.CreateUC.Execute(r.Context(), domain.CreateItineraryCommand{
		UserName:             req.UserName,
		OriginAirportID:      req.OriginAirportID,
		DestinationAirportID: req.DestinationAirportID,
		TravelDate:           travelDate,
		DurationMinutes:      req.DurationMinutes,
		PackingItems:         toDomainPacking(req.PackingItems),
		PlanItems:            toDomainPlans(req.PlanItems),
	})
	if err != nil {
		h.writeDomainError(w, traceID, err)
		return
	}
	h.Log.Info("itinerary_created", "itinerary_id", created.ID, "trace_id", traceID)
	writeJSON(w, http.StatusCreated, toResponse(created))
}

func (h Handlers) Update(w http.ResponseWriter, r *http.Request) {
	traceID := logging.TraceIDFromContext(r.Context())
	id := r.PathValue("id")
	var req ItineraryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeProblem(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON", traceID)
		return
	}
	travelDate, err := parseTravelDate(req.TravelDate)
	if err != nil {
		writeProblem(w, http.StatusBadRequest, "invalid_travel_date", "travelDate must use YYYY-MM-DD", traceID)
		return
	}

	updated, err := h.UpdateUC.Execute(r.Context(), domain.UpdateItineraryCommand{
		ID:                   id,
		UserName:             req.UserName,
		OriginAirportID:      req.OriginAirportID,
		DestinationAirportID: req.DestinationAirportID,
		TravelDate:           travelDate,
		DurationMinutes:      req.DurationMinutes,
		PackingItems:         toDomainPacking(req.PackingItems),
		PlanItems:            toDomainPlans(req.PlanItems),
	})
	if err != nil {
		h.writeDomainError(w, traceID, err)
		return
	}
	h.Log.Info("itinerary_updated", "itinerary_id", updated.ID, "trace_id", traceID)
	writeJSON(w, http.StatusOK, toResponse(updated))
}

func (h Handlers) Get(w http.ResponseWriter, r *http.Request) {
	traceID := logging.TraceIDFromContext(r.Context())
	item, err := h.GetUC.Execute(r.Context(), r.PathValue("id"))
	if err != nil {
		h.writeDomainError(w, traceID, err)
		return
	}
	writeJSON(w, http.StatusOK, toResponse(item))
}

func (h Handlers) List(w http.ResponseWriter, r *http.Request) {
	traceID := logging.TraceIDFromContext(r.Context())
	items, err := h.ListUC.Execute(r.Context())
	if err != nil {
		h.writeDomainError(w, traceID, err)
		return
	}
	out := make([]ItineraryResponse, 0, len(items))
	for _, item := range items {
		out = append(out, toResponse(item))
	}
	h.Log.Info("itineraries_listed", "count", len(out), "trace_id", traceID)
	writeJSON(w, http.StatusOK, map[string]any{"count": len(out), "items": out})
}

func (h Handlers) Delete(w http.ResponseWriter, r *http.Request) {
	traceID := logging.TraceIDFromContext(r.Context())
	if err := h.DeleteUC.Execute(r.Context(), r.PathValue("id")); err != nil {
		h.writeDomainError(w, traceID, err)
		return
	}
	h.Log.Info("itinerary_deleted", "itinerary_id", r.PathValue("id"), "trace_id", traceID)
	w.WriteHeader(http.StatusNoContent)
}

func (h Handlers) writeDomainError(w http.ResponseWriter, traceID string, err error) {
	switch {
	case errors.Is(err, domain.ErrInvalidInput):
		writeProblem(w, http.StatusBadRequest, "invalid_input", "Itinerary input is invalid", traceID)
	case errors.Is(err, domain.ErrNotFound):
		writeProblem(w, http.StatusNotFound, "itinerary_not_found", "Itinerary was not found", traceID)
	case errors.Is(err, domain.ErrAirportInvalid):
		writeProblem(w, http.StatusUnprocessableEntity, "airport_invalid", "One or both airports do not exist", traceID)
	case errors.Is(err, domain.ErrAirportUnavailable):
		h.Log.Error("airport_unavailable", "error", err.Error(), "trace_id", traceID)
		writeProblem(w, http.StatusServiceUnavailable, "airport_unavailable", "Airport service is temporarily unavailable", traceID)
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
