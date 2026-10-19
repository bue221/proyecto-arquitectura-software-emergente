package httpapi_test

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/bue221/personal-itineraries/services/airport-service/internal/adapters/in/httpapi"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/application"
	"github.com/bue221/personal-itineraries/services/airport-service/internal/domain"
)

type fakeProvider struct{}

func (fakeProvider) GetByID(ctx context.Context, id string) (domain.Airport, error) {
	if id == "1" {
		return domain.Airport{ID: "1", Name: "El Dorado International Airport", IATACode: "BOG"}, nil
	}
	return domain.Airport{}, domain.ErrNotFound
}

func (fakeProvider) ListAll(ctx context.Context) ([]domain.Airport, error) {
	return nil, nil
}

type pactFile struct {
	Interactions []struct {
		Description string `json:"description"`
		Request     struct {
			Method string `json:"method"`
			Path   string `json:"path"`
		} `json:"request"`
		Response struct {
			Status int `json:"status"`
		} `json:"response"`
	} `json:"interactions"`
}

func TestPactProvider_AirportInteractions(t *testing.T) {
	_, file, _, _ := runtime.Caller(0)
	root := filepath.Clean(filepath.Join(filepath.Dir(file), "..", "..", "..", "..", "..", ".."))
	raw, err := os.ReadFile(filepath.Join(root, "packages", "contracts", "pact", "Airport-Itinerary.json"))
	if err != nil {
		t.Fatal(err)
	}
	var pact pactFile
	if err := json.Unmarshal(raw, &pact); err != nil {
		t.Fatal(err)
	}

	h := httpapi.Handlers{
		GetAirport: application.GetAirport{Provider: fakeProvider{}},
		Log:        slog.Default(),
	}
	router := httpapi.NewRouter(h, nil)
	srv := httptest.NewServer(router)
	defer srv.Close()

	for _, ix := range pact.Interactions {
		req, err := http.NewRequest(ix.Request.Method, srv.URL+ix.Request.Path, nil)
		if err != nil {
			t.Fatal(err)
		}
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			t.Fatal(err)
		}
		_ = res.Body.Close()
		if res.StatusCode != ix.Response.Status {
			t.Fatalf("%s: status=%d want %d", ix.Description, res.StatusCode, ix.Response.Status)
		}
	}
}
