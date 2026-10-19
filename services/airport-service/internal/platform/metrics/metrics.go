package metrics

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	CBState = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "airport_circuit_breaker_open",
		Help: "1 when circuit breaker is open, else 0",
	})
	BulkheadRejected = promauto.NewCounter(prometheus.CounterOpts{
		Name: "airport_bulkhead_rejected_total",
		Help: "Upstream calls rejected because bulkhead was full",
	})
	UpstreamCalls = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "airport_upstream_calls_total",
		Help: "Colombia upstream call outcomes",
	}, []string{"result"})
)

func Handler() http.Handler {
	return promhttp.Handler()
}

func SetBreakerOpen(open bool) {
	if open {
		CBState.Set(1)
		return
	}
	CBState.Set(0)
}
