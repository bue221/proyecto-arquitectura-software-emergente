# Frontend architecture (`apps/web`)

## Why

Premium itinerary **studio**: interactive Colombia map + glassmorphic builder panel. The browser only talks to internal services via the API Gateway — never to API Colombia.

## Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 App Router |
| Styling | Tailwind CSS v4 + CSS variables (slate / emerald / indigo) |
| Design system | shadcn/ui + glass panels |
| Map engine | **React-Leaflet** |
| Map tiles | **Adapter pattern** — free providers, no API key |
| Motion | Framer Motion |
| Typography | Inter |
| Auth | Demo login → Gateway JWT + profile in `localStorage` |

## Map tile adapters (hexagonal)

The studio depends on a **port** (`MapTileStyle` / `MapTileProvider`), not on a CDN brand.

```text
features/studio/map/
  port.ts                 # contract (no infra)
  registry.ts             # factory + env/localStorage resolution
  MapTileLayer.tsx        # Leaflet consumer of the port
  TileProviderSwitch.tsx  # runtime swap UI
  adapters/
    carto-positron.ts     # default light minimal
    carto-dark.ts
    osm.ts
    opentopo.ts
    esri-gray.ts
```

| Adapter id | Source | API key |
|------------|--------|---------|
| `carto-positron` | CARTO light | none |
| `carto-dark` | CARTO dark | none |
| `osm` | OpenStreetMap | none |
| `opentopo` | OpenTopoMap | none |
| `esri-gray` | Esri Light Gray canvas | none |

Default: `NEXT_PUBLIC_MAP_TILE_PROVIDER=carto-positron` (override in `.env.local`).  
Runtime: tile switcher on the studio (persists to `localStorage`).

To add Mapbox later: implement `MapTileProvider` with `requiresApiKey: true` behind the same port — map interaction code stays untouched.

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

## Env

- `NEXT_PUBLIC_API_GATEWAY_URL` (default `http://localhost:8080`)
- `NEXT_PUBLIC_MAP_TILE_PROVIDER` (`carto-positron` \| `carto-dark` \| `osm` \| `opentopo` \| `esri-gray`)
