package config

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// ApplyVaultKV overlays secrets from Vault KV v2 when VAULT_ADDR + VAULT_TOKEN are set.
// Path defaults to secret/data/airport (mount secret, key airport).
func ApplyVaultKV(cfg *Config) error {
	addr := strings.TrimRight(os.Getenv("VAULT_ADDR"), "/")
	token := os.Getenv("VAULT_TOKEN")
	if addr == "" || token == "" {
		return nil
	}
	path := os.Getenv("VAULT_SECRET_PATH")
	if path == "" {
		path = "secret/data/airport"
	}
	req, err := http.NewRequest(http.MethodGet, addr+"/v1/"+strings.TrimPrefix(path, "/"), nil)
	if err != nil {
		return err
	}
	req.Header.Set("X-Vault-Token", token)
	client := &http.Client{Timeout: 5 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("vault request: %w", err)
	}
	defer res.Body.Close()
	body, err := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if err != nil {
		return err
	}
	if res.StatusCode >= 300 {
		return fmt.Errorf("vault status %d: %s", res.StatusCode, string(body))
	}
	var payload struct {
		Data struct {
			Data map[string]any `json:"data"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		return fmt.Errorf("vault decode: %w", err)
	}
	data := payload.Data.Data
	if v, ok := data["colombia_api_base_url"].(string); ok && v != "" {
		cfg.ColombiaAPIBaseURL = v
	}
	if v, ok := data["redis_addr"].(string); ok && v != "" {
		cfg.RedisAddr = v
	}
	return nil
}
