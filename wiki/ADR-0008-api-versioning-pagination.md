# ADR-0008: versionado de API por URI y paginación de listas

- **Estado:** Aceptado
- **Fecha:** 2026-10-19

## Contexto

El Nivel 3 exige versionado explícito de la API y paginación en los listados, para que los clientes evolucionen sin payloads sin límite.

## Decisión

1. **Versionado:** las APIs HTTP públicas viven bajo `/api/v1/...`. Toda respuesta exitosa envía el header `API-Version: 1`. Un cambio incompatible exige `/api/v2` (rutas nuevas), no renombrar campos en silencio dentro de v1.
2. **Paginación:** `GET /api/v1/itineraries` usa paginación por offset:
   - Query: `page` (default 1), `pageSize` (default 20, máximo 100)
   - Cuerpo: `items`, `count`, `page`, `pageSize`, `total`, `totalPages`
3. El listado de aeropuertos para el mapa no se pagina (el catálogo de Colombia está acotado); el header de versión sí aplica.

## Consecuencias

- Los clientes web que ignoren los campos de paginación siguen funcionando (`items` se conserva).
- El Gateway sigue haciendo proxy por prefijo de ruta; no hay lógica de negocio para paginar.
