# apps/web

Next.js (App Router) + Plotly.js frontend for Personal Itineraries.

## Run locally

```bash
# terminal 1 — Airport Service
cd ../../services/airport-service && go run ./cmd/server

# terminal 2 — Web
cp .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

The browser calls **only** `NEXT_PUBLIC_AIRPORT_API_URL` (Airport Service). It never calls API Colombia.

## Docs

- [`../../docs/02-services/airport-service.md`](../../docs/02-services/airport-service.md)
- [`../../AGENTS.md`](../../AGENTS.md)
