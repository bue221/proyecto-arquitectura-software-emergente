package httpapi

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/bue221/personal-itineraries/services/api-gateway/internal/auth"
	"github.com/bue221/personal-itineraries/services/api-gateway/internal/platform/logging"
)

type Handlers struct {
	Tokens *auth.TokenService
}

type tokenRequest struct {
	Subject string `json:"subject"`
	Role    string `json:"role"`
}

type tokenResponse struct {
	AccessToken string `json:"accessToken"`
	TokenType   string `json:"tokenType"`
	ExpiresAt   string `json:"expiresAt"`
}

func (h Handlers) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "api-gateway"})
}

// IssueToken is a demo-only edge helper to obtain JWTs for local/manual testing.
// It does not encode itinerary or airport business rules.
func (h Handlers) IssueToken(w http.ResponseWriter, r *http.Request) {
	traceID := logging.TraceIDFromContext(r.Context())
	var req tokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeProblem(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON", traceID)
		return
	}
	token, expires, err := h.Tokens.Issue(req.Subject, req.Role)
	if err != nil {
		writeProblem(w, http.StatusBadRequest, "invalid_token_request", "subject is required", traceID)
		return
	}
	writeJSON(w, http.StatusOK, tokenResponse{
		AccessToken: token,
		TokenType:   "Bearer",
		ExpiresAt:   expires.Format(time.RFC3339),
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeProblem(w http.ResponseWriter, status int, code, message, traceID string) {
	writeJSON(w, status, map[string]string{
		"code":     code,
		"message":  message,
		"trace_id": traceID,
	})
}
