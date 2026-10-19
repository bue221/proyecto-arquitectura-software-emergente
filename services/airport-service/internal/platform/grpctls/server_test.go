package grpctls_test

import (
	"path/filepath"
	"runtime"
	"testing"

	"github.com/bue221/personal-itineraries/services/airport-service/internal/platform/grpctls"
)

func TestServerOptions_LoadsDevCerts(t *testing.T) {
	_, file, _, _ := runtime.Caller(0)
	root := filepath.Clean(filepath.Join(filepath.Dir(file), "..", "..", "..", "..", ".."))
	certs := filepath.Join(root, "infra", "certs", "grpc")
	opts, err := grpctls.ServerOptions(true,
		filepath.Join(certs, "server.crt"),
		filepath.Join(certs, "server.key"),
		filepath.Join(certs, "ca.crt"),
	)
	if err != nil {
		t.Fatal(err)
	}
	if len(opts) == 0 {
		t.Fatal("expected TLS server option")
	}
}

func TestServerOptions_Disabled(t *testing.T) {
	opts, err := grpctls.ServerOptions(false, "", "", "")
	if err != nil || opts != nil {
		t.Fatalf("opts=%v err=%v", opts, err)
	}
}
