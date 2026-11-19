# Frontend architecture (`apps/web`)

## Why

Premium itinerary **studio** + trip management: interactive Colombia map, glassmorphic builder, multi-step trip creation with destination plans, packing checklist. The browser only talks to the API Gateway — never to API Colombia.

## Stack (locked UI / UX)

| Concern | Choice | Notes |
|---------|--------|-------|
| Framework | Next.js 15 App Router | SSR metadata / SEO |
| Language | TypeScript + React 19 | |
| Styling | Tailwind CSS v4 + CSS variables | slate / emerald / indigo |
| Components | shadcn/ui (Base UI) | accessible primitives |
| Map engine | React-Leaflet | no Mapbox token required |
| Map tiles | **Adapter pattern** | free providers only by default |
| Motion | Framer Motion | panel, cards, progress |
| Typography | Inter | ExtraBold IATA codes, Medium city names |
| Toasts | Sonner | mutations feedback |
| Auth UX | Demo login → Gateway JWT | profile + usable token in `localStorage`; expired JWT logs out |
| Map prefs | `/profile` config | provider + optional API key; keyed without key → OSM |
| SEO / brand | `icon.svg`, apple-icon, OG/Twitter images, `manifest.ts`, JSON-LD | emerald RutaCO mark |
| SEO routes | `sitemap.ts`, `robots.ts` | `NEXT_PUBLIC_SITE_URL` |

## Visual language

- **Base:** `slate-50` canvas; white / glass surfaces (`white/80` + blur).
- **Primary actions:** `emerald-600` (nature / Colombia nod without cliché).
- **Map routes / selection chrome:** `indigo-600`.
- **Trip cards:** deterministic style variants (`emerald`, `indigo`, `sunset`, `ocean`, `forest`, `slate`) hashed from itinerary id — not identical clones.
- **Studio layout:** full-bleed map + floating glass panel (desktop); bottom sheet panel (mobile).
- **AppShell:** `min-h-dvh` flex column — `main` grows (`flex-1`) so the footer stays at the bottom of the viewport on short pages (`/trips`, `/login`, …).

## Map tile adapters

Port: `MapTileProvider` / `MapTileStyle` under `features/studio/map/`.

| Adapter id | Provider | API key |
|------------|----------|---------|
| `carto-positron` | CARTO light (**product default**) | none |
| `carto-dark` | CARTO dark | none |
| `osm` | OpenStreetMap (fallback when keyed provider has no key) | none |
| `opentopo` | OpenTopoMap | none |
| `esri-gray` | Esri Light Gray | none |
| `mapbox-streets` | Mapbox Streets | user token in `/profile` |

Preferences live in `localStorage` (`rutaco_map_preferences`) and are edited only under **Perfil → Configuración de mapa**. Studio does not show a basemap switcher. Env override: `NEXT_PUBLIC_MAP_TILE_PROVIDER`.

Resolution: if `requiresApiKey` and the stored key is empty → effective style is **OSM**.

`MapTileLayer` must **not** pass `subdomains={undefined}` into Leaflet — `_getSubdomain` always reads `.length`. Omit the prop (Leaflet default `"abc"`) or set it on every adapter.

## Product surfaces

| Route | Purpose | SEO |
|-------|---------|-----|
| `/` | Itinerary Studio (map + panel) | default title / OG |
| `/trips` | Two-step create + trip cards | `title: Mis viajes` |
| `/trips/[id]` | Plans + packing checklist | client page (auth) |
| `/login` | Demo JWT login | |
| `/profile` | Traveler profile + map preferences | |

## Trip creation UX (two steps)

1. **Ruta** — origin / destination (airport select from catalog), date, duration.
2. **Planes** — optional destination recommendations (food, culture, nature, city-specific) + custom plans; user may skip.

Persisted as `planItems` on the Itinerary aggregate (Itinerary Service JSONB).

## Auth session

Demo login (`POST /auth/token`) stores the Gateway JWT in `localStorage` (`pi_access_token`) and the traveler profile (`pi_traveler_profile`). The UI is authenticated only when **both** a profile and a usable access token are present.

Usable means the client can decode the JWT payload (no signature check) and `exp` is a finite number still in the future. Missing, malformed, or expired `exp` is invalid. On load, `AuthProvider` calls `clearSession()` and stays logged out when the stored token is unusable.

`ensureAccessToken` returns a stored usable token. If a profile exists but the token is unusable, it clears the session and throws `SessionExpiredError` instead of silently issuing a demo token. With no profile, it still issues a demo token for guest calls.

Itinerary calls that receive HTTP 401 clear the session and dispatch the `window` event `pi:session-expired`. `AuthProvider` drops the in-memory profile so the header and gated routes (`/profile`, `/trips/[id]`) return to login immediately. The Gateway remains the verifier of the Bearer signature; the client check only avoids staying signed-in with a token the Gateway will reject.

## Folder layout

```text
apps/web/src/
  app/                 # routes, layout SEO, sitemap, robots
  components/layout/   # SiteHeader, AppShell
  features/
    studio/            # map studio + tile adapters
    itineraries/       # wizard, cards, packing, recommendations
    auth/
    airports/api.ts
  lib/
```

## Testing

- Unit runner: Vitest (`npm test` in `apps/web`).
- Covered pure modules: map tile adapters/registry/preferences, `curvedRoute`, recommendations, card styles, `lib/api/http`.
- CI: `web-tests` job in `.github/workflows/ci.yml` (keeps wall clock under 3 minutes with Go jobs).

## Env

- `NEXT_PUBLIC_API_GATEWAY_URL`
- `NEXT_PUBLIC_MAP_TILE_PROVIDER`
- `NEXT_PUBLIC_SITE_URL` — canonical URL for sitemap / Open Graph
