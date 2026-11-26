package metrics

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/prometheus/client_golang/prometheus/testutil"
)

func TestMiddleware_RecordsRouteMethodAndStatus(t *testing.T) {
	m := New()
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/itineraries/{id}", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	})
	resolve := func(r *http.Request) string {
		_, pattern := mux.Handler(r)
		return pattern
	}
	handler := m.Middleware(resolve)(mux)

	for _, id := range []string{"a1", "b2"} {
		handler.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/api/v1/itineraries/"+id, nil))
	}

	got := testutil.ToFloat64(m.requests.WithLabelValues("/api/v1/itineraries/{id}", "GET", "404"))
	if got != 2 {
		t.Fatalf("requests{route=/api/v1/itineraries/{id},code=404}=%v, want 2 (ids must collapse into one series)", got)
	}
	if n := testutil.CollectAndCount(m.duration); n != 1 {
		t.Fatalf("duration series=%d, want 1", n)
	}
	if v := testutil.ToFloat64(m.inFlight); v != 0 {
		t.Fatalf("in-flight=%v after requests finished, want 0", v)
	}
}

func TestMiddleware_UnmatchedPathUsesFixedLabel(t *testing.T) {
	m := New()
	handler := m.Middleware(func(*http.Request) string { return "" })(http.NotFoundHandler())

	handler.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/random/123", nil))

	if got := testutil.ToFloat64(m.requests.WithLabelValues(UnmatchedRoute, "GET", "404")); got != 1 {
		t.Fatalf("unmatched requests=%v, want 1", got)
	}
}

func TestMiddleware_DefaultsTo200WhenHandlerOnlyWrites(t *testing.T) {
	m := New()
	handler := m.Middleware(func(*http.Request) string { return "/health" })(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = io.WriteString(w, "ok")
	}))

	handler.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/health", nil))

	if got := testutil.ToFloat64(m.requests.WithLabelValues("/health", "GET", "200")); got != 1 {
		t.Fatalf("requests{code=200}=%v, want 1", got)
	}
}

func TestHandler_ExposesGatewayAndRuntimeMetrics(t *testing.T) {
	m := New()
	m.requests.WithLabelValues("/health", "GET", "200").Inc()

	rec := httptest.NewRecorder()
	m.Handler().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/metrics", nil))

	body := rec.Body.String()
	for _, want := range []string{"gateway_http_requests_total", "gateway_http_requests_in_flight", "go_goroutines"} {
		if !strings.Contains(body, want) {
			t.Fatalf("metrics output missing %q", want)
		}
	}
}

func TestRouteLabel(t *testing.T) {
	cases := map[string]string{
		"":                                UnmatchedRoute,
		"GET /api/v1/airports":            "/api/v1/airports",
		"/health":                         "/health",
		"DELETE /api/v1/itineraries/{id}": "/api/v1/itineraries/{id}",
	}
	for in, want := range cases {
		if got := routeLabel(in); got != want {
			t.Errorf("routeLabel(%q)=%q, want %q", in, got, want)
		}
	}
}
