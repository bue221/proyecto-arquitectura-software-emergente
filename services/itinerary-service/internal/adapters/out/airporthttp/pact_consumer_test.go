package airporthttp_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/adapters/out/airporthttp"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/platform/logging"
)

type pactFile struct {
	Interactions []struct {
		Description string `json:"description"`
		Request     struct {
			Method  string            `json:"method"`
			Path    string            `json:"path"`
			Headers map[string]string `json:"headers"`
		} `json:"request"`
		Response struct {
			Status int `json:"status"`
		} `json:"response"`
	} `json:"interactions"`
}

func loadPact(t *testing.T) pactFile {
	t.Helper()
	_, file, _, _ := runtime.Caller(0)
	root := filepath.Clean(filepath.Join(filepath.Dir(file), "..", "..", "..", "..", "..", ".."))
	raw, err := os.ReadFile(filepath.Join(root, "packages", "contracts", "pact", "Airport-Itinerary.json"))
	if err != nil {
		t.Fatal(err)
	}
	var p pactFile
	if err := json.Unmarshal(raw, &p); err != nil {
		t.Fatal(err)
	}
	return p
}

func TestPactConsumer_EnsureExists(t *testing.T) {
	pact := loadPact(t)
	if len(pact.Interactions) < 2 {
		t.Fatal("expected at least 2 interactions")
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/airports/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		switch id {
		case "1":
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"id":"1","name":"El Dorado International Airport","iataCode":"BOG"}`))
		default:
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			_, _ = w.Write([]byte(`{"code":"airport_not_found","message":"Airport was not found"}`))
		}
	})
	srv := httptest.NewServer(mux)
	defer srv.Close()

	client := airporthttp.New(srv.URL, 0)

	ctx := logging.WithTraceID(context.Background(), "pact-trace-1")
	if err := client.EnsureExists(ctx, "1"); err != nil {
		t.Fatalf("existing airport: %v", err)
	}
	if err := client.EnsureExists(context.Background(), "99999"); err != domain.ErrAirportInvalid {
		t.Fatalf("missing airport want ErrAirportInvalid got %v", err)
	}

	// Contract shape check: interactions match consumer paths.
	if pact.Interactions[0].Request.Path != "/api/v1/airports/1" {
		t.Fatalf("pact path mismatch: %s", pact.Interactions[0].Request.Path)
	}
	if pact.Interactions[1].Response.Status != 404 {
		t.Fatalf("pact missing status want 404")
	}
}
