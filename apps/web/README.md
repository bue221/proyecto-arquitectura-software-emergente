# apps/web

Next.js (App Router) + Plotly.js frontend for Personal Itineraries.

## Run locally

```bash
# Prefer Compose for full Level 1:
# docker compose -f ../../infra/docker/docker-compose.yml up --build

# Or native:
# terminal 1 — Airport Service
cd ../../services/airport-service && go run ./cmd/server

# terminal 2 — Itinerary Service (+ Postgres on 5434)
cd ../../services/itinerary-service && go run ./cmd/server

# terminal 3 — Web
cp .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

The browser calls **only** Airport (`:8081`) and Itinerary (`:8082`) APIs. It never calls API Colombia.

## Docs

- [`../../docs/02-services/airport-service.md`](../../docs/02-services/airport-service.md)
- [`../../AGENTS.md`](../../AGENTS.md)
