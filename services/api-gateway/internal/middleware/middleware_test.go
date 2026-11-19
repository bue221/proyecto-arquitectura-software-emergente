package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/bue221/personal-itineraries/services/api-gateway/internal/auth"
)

func TestRateLimit_BlocksBurstExcess(t *testing.T) {
	handler := RateLimit(1, 1)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	req.RemoteAddr = "203.0.113.10:1234"

	first := httptest.NewRecorder()
	handler.ServeHTTP(first, req)
	if first.Code != http.StatusNoContent {
		t.Fatalf("first status=%d", first.Code)
	}

	second := httptest.NewRecorder()
	handler.ServeHTTP(second, req)
	if second.Code != http.StatusTooManyRequests {
		t.Fatalf("second status=%d", second.Code)
	}
	var problem Problem
	if err := json.Unmarshal(second.Body.Bytes(), &problem); err != nil {
		t.Fatal(err)
	}
	if problem.Code != "rate_limited" {
		t.Fatalf("code=%s", problem.Code)
	}
}

func TestRequireJWT_RejectsMissingAndPropagatesClaims(t *testing.T) {
	tokens := auth.NewTokenService("secret", "test-issuer", time.Hour)
	ok := false
	handler := RequireJWT(tokens)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ok = true
		if r.Header.Get("X-User-Sub") != "ana" || r.Header.Get("X-User-Role") != "traveler" {
			t.Fatalf("missing identity headers: %+v", r.Header)
		}
		w.WriteHeader(http.StatusNoContent)
	}))

	missing := httptest.NewRecorder()
	handler.ServeHTTP(missing, httptest.NewRequest(http.MethodGet, "/secure", nil))
	if missing.Code != http.StatusUnauthorized {
		t.Fatalf("missing token status=%d", missing.Code)
	}
	if ok {
		t.Fatal("handler should not run without JWT")
	}

	token, _, err := tokens.Issue("ana", "traveler")
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(http.MethodGet, "/secure", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	allowed := httptest.NewRecorder()
	handler.ServeHTTP(allowed, req)
	if allowed.Code != http.StatusNoContent {
		t.Fatalf("valid token status=%d body=%s", allowed.Code, allowed.Body.String())
	}
	if !ok {
		t.Fatal("expected handler to run")
	}
}

func TestCORS_Preflight(t *testing.T) {
	handler := CORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest(http.MethodOptions, "/any", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusNoContent {
		t.Fatalf("status=%d", rec.Code)
	}
	if rec.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Fatal("missing CORS origin")
	}
}

func TestClientIP_PrefersXForwardedFor(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = "10.0.0.1:9"
	req.Header.Set("X-Forwarded-For", "198.51.100.7, 10.0.0.2")
	if got := clientIP(req); got != "198.51.100.7" {
		t.Fatalf("got %s", got)
	}
}

func TestTrace_SetsHeader(t *testing.T) {
	handler := Trace(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("X-Trace-Id", "trace-fixed")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Header().Get("X-Trace-Id") != "trace-fixed" {
		t.Fatalf("trace=%s", rec.Header().Get("X-Trace-Id"))
	}
}
