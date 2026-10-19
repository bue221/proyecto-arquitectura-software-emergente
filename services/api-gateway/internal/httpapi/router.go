package httpapi

import (
	"net/http"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"

	"github.com/bue221/personal-itineraries/services/api-gateway/internal/auth"
	"github.com/bue221/personal-itineraries/services/api-gateway/internal/middleware"
)

type Upstream struct {
	Airport   http.Handler
	Itinerary http.Handler
}

func NewRouter(h Handlers, tokens *auth.TokenService, up Upstream, rateRPS float64, rateBurst int) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", h.Health)
	mux.HandleFunc("GET /ready", h.Health)
	mux.HandleFunc("GET /live", h.Health)
	mux.HandleFunc("POST /auth/token", h.IssueToken)

	// Public catalog reads through the gateway (no business logic here).
	mux.Handle("GET /api/v1/airports", up.Airport)
	mux.Handle("GET /api/v1/airports/{id}", up.Airport)
	mux.Handle("GET /api/v1/demo/fail", up.Airport)

	// Itinerary surface is protected at the edge.
	protected := middleware.RequireJWT(tokens)
	mux.Handle("GET /api/v1/itineraries", protected(up.Itinerary))
	mux.Handle("POST /api/v1/itineraries", protected(up.Itinerary))
	mux.Handle("GET /api/v1/itineraries/{id}", protected(up.Itinerary))
	mux.Handle("PUT /api/v1/itineraries/{id}", protected(up.Itinerary))
	mux.Handle("DELETE /api/v1/itineraries/{id}", protected(up.Itinerary))

	var handler http.Handler = mux
	handler = middleware.RateLimit(rateRPS, rateBurst)(handler)
	handler = middleware.Trace(handler)
	handler = middleware.CORS(handler)
	return otelhttp.NewHandler(handler, "api-gateway")
}
