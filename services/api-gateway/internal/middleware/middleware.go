package middleware

import (
	"encoding/json"
	"net"
	"net/http"
	"strings"
	"sync"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel/trace"
	"golang.org/x/time/rate"

	"github.com/bue221/personal-itineraries/services/api-gateway/internal/auth"
	"github.com/bue221/personal-itineraries/services/api-gateway/internal/platform/logging"
)

type Problem struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	TraceID string `json:"trace_id,omitempty"`
}

func Trace(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		traceID := r.Header.Get("X-Trace-Id")
		if traceID == "" {
			traceID = r.Header.Get("X-Request-Id")
		}
		if sc := trace.SpanFromContext(r.Context()).SpanContext(); sc.IsValid() {
			traceID = sc.TraceID().String()
		}
		if traceID == "" {
			traceID = uuid.NewString()
		}
		ctx := logging.WithTraceID(r.Context(), traceID)
		w.Header().Set("X-Trace-Id", traceID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Trace-Id")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

type ipLimiter struct {
	mu       sync.Mutex
	limiters map[string]*rate.Limiter
	rps      rate.Limit
	burst    int
}

func newIPLimiter(rps float64, burst int) *ipLimiter {
	return &ipLimiter{
		limiters: make(map[string]*rate.Limiter),
		rps:      rate.Limit(rps),
		burst:    burst,
	}
}

func (l *ipLimiter) get(ip string) *rate.Limiter {
	l.mu.Lock()
	defer l.mu.Unlock()
	if lim, ok := l.limiters[ip]; ok {
		return lim
	}
	lim := rate.NewLimiter(l.rps, l.burst)
	l.limiters[ip] = lim
	return lim
}

func RateLimit(rps float64, burst int) func(http.Handler) http.Handler {
	limiter := newIPLimiter(rps, burst)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := clientIP(r)
			if !limiter.get(ip).Allow() {
				writeProblem(w, http.StatusTooManyRequests, "rate_limited", "Too many requests", logging.TraceIDFromContext(r.Context()))
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func RequireJWT(tokens *auth.TokenService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			traceID := logging.TraceIDFromContext(r.Context())
			raw := bearerToken(r.Header.Get("Authorization"))
			claims, err := tokens.Parse(raw)
			if err != nil {
				writeProblem(w, http.StatusUnauthorized, "unauthorized", "Valid Bearer JWT is required", traceID)
				return
			}
			// Propagate identity hints for downstream services (still no business logic here).
			r.Header.Set("X-User-Sub", claims.Sub)
			r.Header.Set("X-User-Role", claims.Role)
			next.ServeHTTP(w, r)
		})
	}
}

func bearerToken(header string) string {
	if header == "" {
		return ""
	}
	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return ""
	}
	return strings.TrimSpace(parts[1])
}

func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return strings.TrimSpace(strings.Split(xff, ",")[0])
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func writeProblem(w http.ResponseWriter, status int, code, message, traceID string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(Problem{Code: code, Message: message, TraceID: traceID})
}
