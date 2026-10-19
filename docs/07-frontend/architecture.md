# Frontend architecture (`apps/web`)

## Why

Centralize UI through a design system so features stay thin, consistent, and easy to test. The browser only talks to internal services (Airport / Itinerary / later Gateway) — never to API Colombia.

## Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 App Router |
| Styling | Tailwind CSS v4 + CSS variables |
| Design system | shadcn/ui (Base Nova) |
| Icons | lucide-react |
| Toasts | Sonner (`toast` from `sonner`) |
| Maps | Plotly via `react-plotly.js` (client-only) |

## Folder layout

```text
apps/web/src/
  app/                      # routes, layout, global styles
  components/
    ui/                     # shadcn primitives (button, card, input, alert, sonner…)
    layout/                 # AppShell, PageHeader
  features/
    airports/               # map feature (api + components)
    itineraries/            # itinerary CRUD feature (api + components)
  lib/
    api/http.ts             # shared fetch helpers + ApiError
    utils.ts                # cn()
  hooks/                    # shared hooks (as needed)
```

## Dependency rules

1. `app/` may import `features/*` and `components/*`.
2. `features/*` may import `components/ui`, `components/layout`, and `lib/*`.
3. `features/A` must not import `features/B` internals (share via `lib` or lift state).
4. `components/ui` is generated/owned by shadcn — prefer `npx shadcn@latest add <name>` over hand edits.
5. No feature may call `api-colombia.com`.

## UX feedback

Use **Sonner** for success/error toasts on mutations (create/delete itinerary). Keep inline `Alert` for persistent panel errors (e.g. service down).

## Adding a UI primitive

```bash
cd apps/web
npx shadcn@latest add <component>
```

## Env

See `.env.local.example`:

- `NEXT_PUBLIC_API_GATEWAY_URL` (preferred; default `http://localhost:8080`)
- `NEXT_PUBLIC_AIRPORT_API_URL` / `NEXT_PUBLIC_ITINERARY_API_URL` (should also point at the gateway)

Itinerary calls obtain a demo JWT via `POST /auth/token` and send `Authorization: Bearer …`.
