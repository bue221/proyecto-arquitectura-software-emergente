# apps/web

Next.js App Router frontend with **shadcn/ui** design system, Sonner toasts, and feature-based folders.

## Architecture

See [`../../docs/07-frontend/architecture.md`](../../docs/07-frontend/architecture.md).

```text
src/
  components/ui/        # shadcn primitives
  components/layout/    # AppShell, PageHeader
  features/airports/    # map
  features/itineraries/ # CRUD panel
  lib/api/              # shared HTTP helpers
```

## Run

```bash
# Prefer Compose for full Level 1:
docker compose -f ../../infra/docker/docker-compose.yml up --build

# Or native web only (APIs already running):
cp .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

## Design system

```bash
npx shadcn@latest add <component>
```

Toasts: `import { toast } from "sonner"` (Toaster mounted in `app/layout.tsx`).

The browser calls **only** Airport (`:8081`) and Itinerary (`:8082`). Never API Colombia.
