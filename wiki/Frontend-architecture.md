# Arquitectura del frontend (`apps/web`)

## Por qué

**Studio** de itinerarios y gestión de viajes: mapa interactivo de Colombia, constructor en vidrio, creación en varios pasos con planes en el destino y checklist de equipaje. El navegador solo habla con el API Gateway — nunca con API Colombia.

## Stack (UI / UX cerrado)

| Preocupación | Elección | Notas |
|--------------|----------|-------|
| Framework | Next.js 15 App Router | Metadatos SSR / SEO |
| Lenguaje | TypeScript + React 19 | |
| Estilos | Tailwind CSS v4 + variables CSS | slate / emerald / indigo |
| Componentes | shadcn/ui (Base UI) | primitivas accesibles |
| Motor de mapa | React-Leaflet | no exige token de Mapbox |
| Teselas | **Patrón Adapter** | por defecto solo proveedores gratuitos |
| Movimiento | Framer Motion | panel, tarjetas, progreso |
| Tipografía | Inter | códigos IATA ExtraBold, ciudades Medium |
| Toasts | Sonner | feedback de mutaciones |
| Auth UX | Login demo → JWT del Gateway | perfil en `localStorage` |
| Preferencias de mapa | Configuración en `/profile` | proveedor + API key opcional; con key vacía → OSM |
| SEO / marca | `icon.svg`, apple-icon, imágenes OG/Twitter, `manifest.ts`, JSON-LD | marca esmeralda RutaCO |
| Rutas SEO | `sitemap.ts`, `robots.ts` | `NEXT_PUBLIC_SITE_URL` |

## Lenguaje visual

- **Base:** lienzo `slate-50`; superficies blancas / vidrio (`white/80` + blur).
- **Acciones primarias:** `emerald-600` (naturaleza / guiño a Colombia, sin cliché).
- **Rutas del mapa y cromo de selección:** `indigo-600`.
- **Tarjetas de viaje:** variantes deterministas (`emerald`, `indigo`, `sunset`, `ocean`, `forest`, `slate`) hasheadas desde el id del itinerario — no son clones idénticos.
- **Layout del Studio:** mapa a sangre + panel flotante de vidrio (desktop); panel en bottom sheet (mobile).
- **AppShell:** columna flex `min-h-dvh` — `main` crece (`flex-1`) para que el footer quede al fondo del viewport en páginas cortas (`/trips`, `/login`, …).

## Adaptadores de teselas

Puerto: `MapTileProvider` / `MapTileStyle` en `features/studio/map/`.

| Id del adapter | Proveedor | API key |
|----------------|-----------|---------|
| `carto-positron` | CARTO claro (**default del producto**) | ninguna |
| `carto-dark` | CARTO oscuro | ninguna |
| `osm` | OpenStreetMap (fallback si un proveedor con key no tiene key) | ninguna |
| `opentopo` | OpenTopoMap | ninguna |
| `esri-gray` | Esri Light Gray | ninguna |
| `mapbox-streets` | Mapbox Streets | token de la persona en `/profile` |

Las preferencias viven en `localStorage` (`rutaco_map_preferences`) y solo se editan en **Perfil → Configuración de mapa**. El Studio no muestra un selector de mapa base. Override por entorno: `NEXT_PUBLIC_MAP_TILE_PROVIDER`.

Resolución: si `requiresApiKey` y la key guardada está vacía → el estilo efectivo es **OSM**.

`MapTileLayer` no debe pasar `subdomains={undefined}` a Leaflet: `_getSubdomain` siempre lee `.length`. Omite la prop (default de Leaflet `"abc"`) o defínela en cada adapter.

## Superficies del producto

| Ruta | Propósito | SEO |
|------|-----------|-----|
| `/` | Studio de itinerarios (mapa + panel) | título / OG por defecto |
| `/trips` | Creación en dos pasos + tarjetas | `title: Mis viajes` |
| `/trips/[id]` | Planes + checklist de equipaje | página cliente (auth) |
| `/login` | Login JWT de demo | |
| `/profile` | Perfil del viajero + preferencias de mapa | |

## UX de creación (dos pasos)

1. **Ruta** — origen / destino (select de aeropuertos del catálogo), fecha, duración.
2. **Planes** — recomendaciones opcionales del destino (comida, cultura, naturaleza, específicas de la ciudad) + planes propios; se puede omitir.

Se persisten como `planItems` en el agregado Itinerary (JSONB de Itinerary Service).

## Carpetas

```text
apps/web/src/
  app/                 # rutas, SEO del layout, sitemap, robots
  components/layout/   # SiteHeader, AppShell
  features/
    studio/            # studio del mapa + adapters de teselas
    itineraries/       # wizard, tarjetas, packing, recomendaciones
    auth/
    airports/api.ts
  lib/
```

## Entorno

- `NEXT_PUBLIC_API_GATEWAY_URL`
- `NEXT_PUBLIC_MAP_TILE_PROVIDER`
- `NEXT_PUBLIC_SITE_URL` — URL canónica para sitemap / Open Graph
