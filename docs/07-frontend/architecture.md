# Frontend architecture (`apps/web`)

## Why

Premium itinerary **studio**: interactive Colombia map + glassmorphic builder panel. The browser only talks to internal services via the API Gateway — never to API Colombia.

## Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 App Router |
| Styling | Tailwind CSS v4 + CSS variables (slate / emerald / indigo) |
| Design system | shadcn/ui + glass panels |
| Map | **React-Leaflet** + CARTO Positron tiles (no Mapbox token required) |
| Motion | Framer Motion (panel + flight card + progress) |
| Typography | Inter |
| Auth | Demo login → Gateway JWT + profile in `localStorage` |

## Product surfaces

| Route | Purpose |
|-------|---------|
| `/` | **Itinerary Studio** — full-bleed map + floating panel |
| `/login` | Traveler login |
| `/profile` | Profile editor |
| `/trips` | Saved itineraries |
| `/trips/[id]` | Detail + packing checklist |

Brand: **RutaCO**.

## Studio interaction model

1. Click map airport → sets **origin** (emerald).
2. Second click → sets **destination** (emerald) and draws indigo dashed curve.
3. Combobox search stays in sync with map selection.
4. Logged-in users can save via Itinerary Service (`POST /api/v1/itineraries`).

Hubs emphasized: BOG, MDE, CTG, CLO, BAQ, PEI (plus other catalog points as secondary nodes).

## Folder layout

```text
apps/web/src/
  app/
  components/layout/     # SiteHeader, AppShell
  features/
    studio/              # map studio (map, panel, geo helpers)
    auth/
    airports/api.ts      # catalog fetch
    itineraries/         # CRUD + packing
  lib/
```

## Env

- `NEXT_PUBLIC_API_GATEWAY_URL` (default `http://localhost:8080`)
