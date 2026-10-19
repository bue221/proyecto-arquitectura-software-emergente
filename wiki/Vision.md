> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Visión y alcance

## Problema

Quien planifica viajes dentro de Colombia necesita una forma confiable de:

- Descubrir aeropuertos reales (validados contra una fuente pública).
- Verlos en un mapa.
- Armar itinerarios personales (origen, destino, fecha, duración).
- Recibir una confirmación asíncrona cuando se crea un itinerario.

El sistema debe comportarse como una **plataforma distribuida real**: aislamiento, resiliencia, observabilidad e integración asíncrona segura.

## Solución (una frase)

Un monorepo con UI de mapa en Next.js y microservicios Go que adaptan datos externos de aeropuertos, persisten itinerarios con límites hexagonales y notifican mediante funciones serverless orientadas a eventos.

## Dentro del alcance

| Área | Alcance |
|------|---------|
| Catálogo de aeropuertos | Consumir API Colombia vía Adapter; caché Redis; mapa |
| Itinerarios | CRUD completo; validar aeropuertos por HTTP (N1) / copia optimizada o gRPC (N2/N3) |
| Notificación async | `ItineraryCreated` → notificación FaaS + BD de historial |
| Borde | API Gateway: enrutamiento, rate limit, propagación de JWT |
| Ops | Docker Compose; logs estructurados; OTel/Jaeger; Prometheus (N2+) |
| Nivel 3 | Transactional Outbox, gRPC, CI/CD, probes K8s, pruebas de contrato, muestras de caos/alertas |

## Fuera de alcance (YAGNI por ahora)

- Cuentas reales de un proveedor de correo en producción (se simula y se persiste el historial).
- Multi-región activo-activo.
- Apps móviles nativas.
- Precios de vuelos o reserva con aerolíneas.
- Base de datos compartida entre servicios.

## Métricas de éxito (curso)

- Checklist de Niveles 1–3 en verde en [Self-assessment](Self-assessment).
- Guion de demo ejecutable, con capturas o video.
- Wiki y ADRs explican Adapter, Outbox y la resolución del double-write.

## Personas

| Persona | Necesidad |
|---------|-----------|
| Viajero | Crear y gestionar itinerarios; ver aeropuertos en el mapa |
| Operador / SRE | Trazas, métricas, alertas, despliegues seguros |
| Revisor (curso) | Docs claros, PRs, Swagger, tests y arquitectura alineada |
