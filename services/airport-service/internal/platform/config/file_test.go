package config_test

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/bue221/personal-itineraries/services/airport-service/internal/platform/config"
)

func TestApplyConfigFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "airport.json")
	if err := os.WriteFile(path, []byte(`{"colombia_api_base_url":"http://mock","upstream_timeout_ms":1234,"bulkhead_max_concurrent":3}`), 0o644); err != nil {
		t.Fatal(err)
	}
	cfg := config.Config{ColombiaAPIBaseURL: "https://api-colombia.com", BulkheadMax: 8}
	if err := config.ApplyConfigFile(&cfg, path); err != nil {
		t.Fatal(err)
	}
	if cfg.ColombiaAPIBaseURL != "http://mock" {
		t.Fatalf("url=%s", cfg.ColombiaAPIBaseURL)
	}
	if cfg.UpstreamTimeout != 1234*time.Millisecond {
		t.Fatalf("timeout=%s", cfg.UpstreamTimeout)
	}
	if cfg.BulkheadMax != 3 {
		t.Fatalf("bulkhead=%d", cfg.BulkheadMax)
	}
}
