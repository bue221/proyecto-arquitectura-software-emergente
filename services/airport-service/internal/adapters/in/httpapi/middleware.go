package httpapi

import (
	"net/http"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel/trace"

	"github.com/bue221/personal-itineraries/services/airport-service/internal/platform/logging"
)

func TraceMiddleware(next http.Handler) http.Handler {
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

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Trace-Id")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
