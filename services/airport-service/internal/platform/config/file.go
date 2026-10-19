package config

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
)

type fileOverlay struct {
	ColombiaAPIBaseURL string `json:"colombia_api_base_url"`
	UpstreamTimeoutMS  int    `json:"upstream_timeout_ms"`
	CacheTTLMS         int    `json:"cache_ttl_ms"`
	BulkheadMax        int    `json:"bulkhead_max_concurrent"`
}

// ApplyConfigFile overlays JSON config (config-server / Vault-rendered file).
func ApplyConfigFile(cfg *Config, path string) error {
	if path == "" {
		return nil
	}
	raw, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("config file: %w", err)
	}
	var overlay fileOverlay
	if err := json.Unmarshal(raw, &overlay); err != nil {
		return fmt.Errorf("config file decode: %w", err)
	}
	if overlay.ColombiaAPIBaseURL != "" {
		cfg.ColombiaAPIBaseURL = overlay.ColombiaAPIBaseURL
	}
	if overlay.UpstreamTimeoutMS > 0 {
		cfg.UpstreamTimeout = time.Duration(overlay.UpstreamTimeoutMS) * time.Millisecond
	}
	if overlay.CacheTTLMS > 0 {
		cfg.CacheTTL = time.Duration(overlay.CacheTTLMS) * time.Millisecond
	}
	if overlay.BulkheadMax > 0 {
		cfg.BulkheadMax = overlay.BulkheadMax
	}
	return nil
}
