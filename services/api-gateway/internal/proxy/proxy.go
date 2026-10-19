package proxy

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	"github.com/bue221/personal-itineraries/services/api-gateway/internal/platform/logging"
)

func New(target string, timeout time.Duration) (*httputil.ReverseProxy, error) {
	u, err := url.Parse(target)
	if err != nil {
		return nil, err
	}
	proxy := httputil.NewSingleHostReverseProxy(u)
	original := proxy.Director
	proxy.Director = func(req *http.Request) {
		original(req)
		req.Host = u.Host
		if trace := logging.TraceIDFromContext(req.Context()); trace != "" {
			req.Header.Set("X-Trace-Id", trace)
		}
		// Authorization is left intact so downstream can also inspect JWT if needed.
	}
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		_, _ = w.Write([]byte(`{"code":"upstream_unavailable","message":"Upstream service is unavailable"}`))
	}
	proxy.Transport = &http.Transport{
		ResponseHeaderTimeout: timeout,
		IdleConnTimeout:       90 * time.Second,
	}
	return proxy, nil
}
