# Frontend architecture (`apps/web`)

## Why

Centralize UI through a design system so features stay thin, consistent, and easy to test. The browser only talks to internal services (via API Gateway) — never to API Colombia.

## Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 App Router |
| Styling | Tailwind CSS v4 + CSS variables |
| Design system | shadcn/ui (Base Nova) |
| Look & feel | Marketplace-style (Airbnb-adjacent): sticky nav, soft cards, rose CTA, Plus Jakarta Sans |
| Icons | lucide-react |
| Toasts | Sonner |
| Maps | Plotly via `react-plotly.js` (client-only) |
| Auth | Demo login → `POST /auth/token` (Gateway JWT) + profile in `localStorage` |

## Product surfaces

| Route | Purpose |
|-------|---------|
| `/` | Explore hero + airport map |
| `/login` | Traveler login (name + email → JWT) |
| `/profile` | Edit display name, city, bio |
| `/trips` | Create/list itineraries (requires session) |
| `/trips/[id]` | Trip detail + packing checklist (persisted on itinerary) |

Brand in UI: **RutaCO**.

## Folder layout

```text
apps/web/src/
  app/                      # routes
  components/
    ui/                     # shadcn primitives
    layout/                 # AppShell, SiteHeader
  features/
    auth/                   # AuthProvider
    airports/               # map
    itineraries/            # trip CRUD UI
  lib/
    api/                    # http + auth token helpers
    auth/session.ts         # token + profile storage
```

## Dependency rules

1. `app/` may import `features/*` and `components/*`.
2. `features/*` may import `components/ui`, `components/layout`, and `lib/*`.
3. `features/A` must not import `features/B` internals (share via `lib` or lift state).
4. No feature may call `api-colombia.com`.

## Env

- `NEXT_PUBLIC_API_GATEWAY_URL` (preferred; default `http://localhost:8080`)
