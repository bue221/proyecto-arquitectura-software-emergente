// Package metrics exposes RED-style Prometheus metrics (rate, errors, duration)
// for every request that reaches the gateway, including the ones rejected at
// the edge (401 JWT, 429 rate limit).
package metrics

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// UnmatchedRoute labels requests that no gateway route matched. Using a fixed
// value (instead of the raw path) keeps label cardinality bounded.
const UnmatchedRoute = "unmatched"

// RouteResolver returns the registered route pattern for a request
// (e.g. "/api/v1/itineraries/{id}"), or "" when nothing matches.
type RouteResolver func(r *http.Request) string

type HTTPMetrics struct {
	registry *prometheus.Registry
	requests *prometheus.CounterVec
	duration *prometheus.HistogramVec
	inFlight prometheus.Gauge
}

func New() *HTTPMetrics {
	registry := prometheus.NewRegistry()
	m := &HTTPMetrics{
		registry: registry,
		requests: prometheus.NewCounterVec(prometheus.CounterOpts{
			Name: "gateway_http_requests_total",
			Help: "HTTP requests handled by the gateway, by route, method and status code.",
		}, []string{"route", "method", "code"}),
		duration: prometheus.NewHistogramVec(prometheus.HistogramOpts{
			Name:    "gateway_http_request_duration_seconds",
			Help:    "End-to-end gateway latency (edge middlewares + upstream proxy).",
			Buckets: []float64{0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10},
		}, []string{"route", "method"}),
		inFlight: prometheus.NewGauge(prometheus.GaugeOpts{
			Name: "gateway_http_requests_in_flight",
			Help: "Requests currently being served by the gateway.",
		}),
	}
	registry.MustRegister(
		m.requests,
		m.duration,
		m.inFlight,
		collectors.NewGoCollector(),
		collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}),
	)
	return m
}

// Handler serves the Prometheus exposition format for this registry.
func (m *HTTPMetrics) Handler() http.Handler {
	return promhttp.HandlerFor(m.registry, promhttp.HandlerOpts{Registry: m.registry})
}

// Middleware records count, latency and in-flight requests. It must wrap the
// whole edge chain so rejected requests (401/429) are measured too.
func (m *HTTPMetrics) Middleware(resolve RouteResolver) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			route := routeLabel(resolve(r))
			recorder := &statusRecorder{ResponseWriter: w, status: http.StatusOK}

			m.inFlight.Inc()
			start := time.Now()
			defer func() {
				m.inFlight.Dec()
				m.duration.WithLabelValues(route, r.Method).Observe(time.Since(start).Seconds())
				m.requests.WithLabelValues(route, r.Method, strconv.Itoa(recorder.status)).Inc()
			}()

			next.ServeHTTP(recorder, r)
		})
	}
}

// routeLabel strips the optional "METHOD " prefix of a ServeMux pattern so the
// method lives only in its own label.
func routeLabel(pattern string) string {
	if pattern == "" {
		return UnmatchedRoute
	}
	if _, path, found := strings.Cut(pattern, " "); found {
		return path
	}
	return pattern
}

type statusRecorder struct {
	http.ResponseWriter
	status      int
	wroteHeader bool
}

func (s *statusRecorder) WriteHeader(code int) {
	if !s.wroteHeader {
		s.status = code
		s.wroteHeader = true
	}
	s.ResponseWriter.WriteHeader(code)
}

func (s *statusRecorder) Write(b []byte) (int, error) {
	s.wroteHeader = true
	return s.ResponseWriter.Write(b)
}

// Unwrap lets http.ResponseController (used by httputil.ReverseProxy to flush)
// reach the underlying writer.
func (s *statusRecorder) Unwrap() http.ResponseWriter {
	return s.ResponseWriter
}
