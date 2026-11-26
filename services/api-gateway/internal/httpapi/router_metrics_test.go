package httpapi

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/bue221/personal-itineraries/services/api-gateway/internal/auth"
	"github.com/bue221/personal-itineraries/services/api-gateway/internal/platform/metrics"
)

func TestRouter_MetricsCountEdgeRejections(t *testing.T) {
	tokens := auth.NewTokenService("secret", "test", time.Hour)
	okUpstream := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })
	router := NewRouter(Handlers{Tokens: tokens}, tokens, Upstream{Airport: okUpstream, Itinerary: okUpstream}, 1, 1, metrics.New())

	call := func(method, path, ip string) int {
		req := httptest.NewRequest(method, path, nil)
		req.RemoteAddr = ip + ":1234"
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)
		return rec.Code
	}

	if code := call(http.MethodGet, "/api/v1/airports", "203.0.113.1"); code != http.StatusOK {
		t.Fatalf("first airports call=%d", code)
	}
	if code := call(http.MethodGet, "/api/v1/airports", "203.0.113.1"); code != http.StatusTooManyRequests {
		t.Fatalf("second airports call=%d, want 429", code)
	}
	if code := call(http.MethodGet, "/api/v1/itineraries", "203.0.113.2"); code != http.StatusUnauthorized {
		t.Fatalf("itineraries without JWT=%d, want 401", code)
	}

	req := httptest.NewRequest(http.MethodGet, "/metrics", nil)
	req.RemoteAddr = "203.0.113.3:1234"
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("/metrics status=%d", rec.Code)
	}

	body := rec.Body.String()
	for _, want := range []string{
		`gateway_http_requests_total{code="200",method="GET",route="/api/v1/airports"} 1`,
		`gateway_http_requests_total{code="429",method="GET",route="/api/v1/airports"} 1`,
		`gateway_http_requests_total{code="401",method="GET",route="/api/v1/itineraries"} 1`,
	} {
		if !strings.Contains(body, want) {
			t.Errorf("metrics missing %s", want)
		}
	}
}
