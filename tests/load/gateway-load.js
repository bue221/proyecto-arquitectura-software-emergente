// k6 load test against the RutaCO API Gateway.
// Run: make load
// Manual: docker run --rm -i -e BASE=http://host.docker.internal:8080 grafana/k6:0.54.0 run - < tests/load/gateway-load.js
// Linux without Docker Desktop: add --network host and BASE=http://localhost:8080
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE || 'http://host.docker.internal:8080';

export const options = {
  scenarios: {
    airports_read: {
      executor: 'ramping-vus',
      exec: 'listAirports',
      stages: [
        { duration: '20s', target: 10 },
        { duration: '40s', target: 30 },
        { duration: '20s', target: 0 },
      ],
    },
    itineraries_write: {
      executor: 'constant-vus',
      exec: 'createItinerary',
      vus: 5,
      duration: '60s',
      startTime: '10s',
    },
  },
  thresholds: {
    'http_req_duration{scenario:airports_read}': ['p(95)<500'],
    'checks': ['rate>0.80'],
  },
};

export function setup() {
  const res = http.post(`${BASE}/auth/token`, JSON.stringify({ subject: 'k6', role: 'traveler' }), {
    headers: { 'Content-Type': 'application/json' },
  });
  return { token: res.json('accessToken') };
}

export function listAirports() {
  const res = http.get(`${BASE}/api/v1/airports`);
  // 429 = Gateway rate limiter doing its job (RATE_LIMIT_RPS=20, BURST=40)
  check(res, { 'airports 200 or 429': (r) => r.status === 200 || r.status === 429 });
  sleep(0.2);
}

export function createItinerary(data) {
  const body = {
    userName: `k6 ${__VU}-${__ITER}`,
    originAirportId: '1',
    destinationAirportId: '2',
    travelDate: '2027-01-15',
    durationMinutes: 90,
  };
  const res = http.post(`${BASE}/api/v1/itineraries`, JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.token}` },
  });
  check(res, { 'create 201/200/429': (r) => [200, 201, 429].includes(r.status) });
  sleep(1);
}
