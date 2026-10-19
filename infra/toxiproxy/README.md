# Toxiproxy chaos (Level 3)

Compose service `toxiproxy` proxies Airport HTTP on host `:18475` → `airport-service:8081`.

## Inject latency (demo)

```bash
# List proxies
curl -s http://localhost:8474/proxies | jq

# Add 2s latency on airport_http
curl -s -X POST http://localhost:8474/proxies/airport_http/toxics \
  -H 'Content-Type: application/json' \
  -d '{"name":"lag","type":"latency","attributes":{"latency":2000,"jitter":200}}'

# Hit via toxic path (or point AIRPORT_SERVICE_URL through toxiproxy)
curl -s -o /dev /dev/null -w '%{time_total}\n' http://localhost:18475/health

# Remove toxic
curl -s -X DELETE http://localhost:8474/proxies/airport_http/toxics/lag
```

Evidence for rubric: CB open / timeouts after latency + Prometheus `AirportCircuitBreakerOpen` when upstream fails.
