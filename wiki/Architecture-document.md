> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Documento de arquitectura de software

**Sistema:** Personal Itineraries Platform  
**Versión del documento:** 0.1.0  
**Fecha:** 2026-10-19  
**Autores:** Equipo del monorepo  
**Estado:** Fase 0 — definición (sin implementación de negocio)

## Versionamiento

| Fecha | Versión | Autor | Cambio |
|-------|---------|-------|--------|
| 2026-10-19 | 0.1.0 | Equipo | Borrador inicial alineado al reto (Niveles 1–3) |

## 1. Abreviaturas y definiciones

| Término | Definición |
|---------|------------|
| API | Interfaz de programación de aplicaciones |
| REST | Estilo de intercambio de recursos sobre HTTP |
| JWT | JSON Web Token para autenticación/autorización |
| BFF / Gateway | Punto único de entrada; enrutamiento sin lógica de negocio |
| Puerto / Adapter | Contrato de dominio vs adaptador de infraestructura (hexagonal) |
| Outbox | Tabla transaccional para publicación confiable de eventos |
| FaaS | Function as a Service (ejecución efímera) |
| OTel | OpenTelemetry |
| DDD | Domain-Driven Design |
| BC | Bounded Context (contexto delimitado) |
| AsyncAPI | Especificación de contratos asíncronos |
| gRPC | RPC sobre HTTP/2 con Protobuf |

## 2. Introducción

Este documento define la arquitectura de software del **Personal Itineraries Platform**, permitiendo identificar requisitos funcionales y técnicos, trazar el alcance de la solución y comunicar a interesados cómo se cumplen atributos de calidad mediante microservicios Go, eventos y funciones serverless, con frontend Next.js.

## 3. Alcance

Incluye: consulta de aeropuertos colombianos (API Colombia vía Adapter), mapa Plotly, CRUD de itinerarios, validación de aeropuertos, notificación asíncrona, resiliencia (cache, CB, retries), observabilidad, Gateway, Outbox, gRPC, CI/CD y despliegue contenedorizado/K8s (Nivel 3).

Excluye: booking real con aerolíneas, app móvil nativa, multi-región activo-activo.

## 4. Interesados

| Interesado | Necesidad de información | Vistas útiles |
|------------|--------------------------|---------------|
| Arquitecto / docente | Decisiones, tácticas, evidencia de patrones | Lógica, integración, ADRs |
| Desarrollador | Contratos, capas hexagonales, flujo Git | Implementación, secuencia |
| QA / revisor | Criterios de aceptación, demos | Despliegue, DevOps, autoevaluación |
| Operador | Logs, trazas, alertas, runbooks | Despliegue, amenazas, CI/CD |
| Viajero (usuario final) | UX confiable y clara | No consume este documento |

## 5. Requerimientos no funcionales (selección)

### 5.1 Seguridad

| ID | Nombre | Descripción |
|----|--------|-------------|
| RNF-S1 | Autenticación JWT | Actores autenticados; Gateway valida y propaga token |
| RNF-S2 | Transferencia segura | HTTPS en entornos desplegados |
| RNF-S3 | Código seguro | Controles alineados a OWASP Top 10; SonarQube en CI |
| RNF-S4 | Auditoría mínima | Logs estructurados de acciones relevantes y fallos |

### 5.2 Interoperabilidad

| ID | Nombre | Descripción |
|----|--------|-------------|
| RNF-I1 | API Colombia | Intercambio HTTP; mapeo vía Adapter al modelo interno |
| RNF-I2 | REST interno | Contratos OpenAPI versionados |
| RNF-I3 | Eventos | Contratos AsyncAPI; cola dedicada de itinerarios |
| RNF-I4 | gRPC (L3) | Itinerary ↔ Airport con Protobuf |

### 5.3 Fiabilidad

| ID | Nombre | Descripción |
|----|--------|-------------|
| RNF-F1 | Tolerancia a fallos | Timeout, retry+backoff+jitter, circuit breaker ante API externa |
| RNF-F2 | Publicación confiable | Outbox transaccional (sin double-write inseguro) |
| RNF-F3 | Recuperación | Migraciones versionadas; datos por servicio aislados |

### 5.4 Eficiencia

| ID | Nombre | Descripción |
|----|--------|-------------|
| RNF-E1 | Cache | Redis en Airport Service para respuestas externas repetidas |
| RNF-E2 | Runtime eficiente | Go por bajo consumo de CPU/memoria bajo concurrencia |
| RNF-E3 | Latencia edge | Rate limiting sin bloquear rutas sanas indebidamente |

### 5.5 Arquitectura

| ID | Nombre | Descripción |
|----|--------|-------------|
| RNF-A1 | Hexagonal | Dominio / aplicación / adaptadores en cada servicio |
| RNF-A2 | Microservicios | Deploy y BD independientes |
| RNF-A3 | Eventos + FaaS | Notificaciones desacopladas |

### 5.6 Mantenibilidad

| ID | Nombre | Descripción |
|----|--------|-------------|
| RNF-M1 | Modularidad | Cambios de Adapter no alteran reglas de itinerario |
| RNF-M2 | Documentación viva | Wiki + Swagger + AsyncAPI + ADRs en el mismo repo |
| RNF-M3 | Testabilidad | Puertos mockeables; E2E con Testcontainers (L2) |

### 5.7 DevOps

| ID | Nombre | Descripción |
|----|--------|-------------|
| RNF-D1 | CI | Build, unit/load tests, lint, SonarQube |
| RNF-D2 | CD | Ejemplo de despliegue continuo (Compose/K8s) |
| RNF-D3 | Git flow académico | Ramas estándar + PR obligatorios |

## 6. Priorización de atributos de calidad

| Atributo | ID | Prioridad (importancia, riesgo) |
|----------|----|----------------------------------|
| Modularidad / hexagonal | RNF-A1 | (H, M) |
| Fiabilidad externa | RNF-F1 | (H, H) |
| Publicación confiable | RNF-F2 | (H, H) |
| Observabilidad | (trazas/logs) | (H, M) |
| Seguridad JWT | RNF-S1 | (H, M) |
| Performance cache | RNF-E1 | (M, M) |
| Deploy K8s | RNF-D2 | (M, H) |

## 7. Tácticas de arquitectura

| RNF | Táctica | Patrón | Tecnología |
|-----|---------|--------|------------|
| RNF-A1 | Separar responsabilidades | Hexagonal / Ports & Adapters | Go modules por capa |
| RNF-I1 | Traducir modelos externos | Adapter | Cliente HTTP API Colombia |
| RNF-F1 | Detectar fallos / limitar daño | Circuit Breaker + Retry | go-resilience libs / custom |
| RNF-E1 | Cachear | Cache-aside | Redis |
| RNF-F2 | Evitar double write | Transactional Outbox | Postgres + publisher |
| RNF-S1 | Autenticar en borde | Gateway + JWT | Gateway Go / Traefik |
| Observabilidad | Correlacionar | Tracing distribuido | OTel + Jaeger |
| RNF-D1/D2 | Automatizar verificación | Pipeline | GitHub Actions |

## 8. Verificación de tácticas

| RNF | Táctica | Escenario | Criterio de aceptación |
|-----|---------|-----------|------------------------|
| RNF-I1 | Adapter | FE pide aeropuertos | FE solo ve DTO interno; cero acoplamiento a schema externo |
| RNF-F1 | CB | API Colombia caída | Respuesta degradada/fallback; CB open observable |
| RNF-F2 | Outbox | Create itinerary | Evento publicado aunque el broker falle temporalmente tras commit |
| JWT | Propagación | Request autenticado | Servicios internos reciben claims; 401 sin token en rutas protegidas |
| OTel | Traza E2E | Create flow | Un trace_id une Gateway → Itinerary → Airport → (async) notify |

## 9. Lineamientos técnicos — componentes

| Componente | Responsabilidad | No debe |
|------------|-----------------|---------|
| `apps/web` | UI, mapa Plotly, CRUD UX | Llamar API Colombia |
| `api-gateway` | Ruteo, rate limit, JWT | Reglas de itinerario |
| `airport-service` | Catálogo + Adapter + cache | Persistir itinerarios |
| `itinerary-service` | CRUD + outbox + validación | Conocer schema API Colombia |
| `notification-function` | Notificar + historial | Exponer CRUD de itinerarios |
| RabbitMQ | Transporte de eventos | Lógica de negocio |
| Redis | Cache / coordinación corta | Fuente de verdad de itinerarios |

## 10. Vistas de arquitectura

Las vistas detalladas viven como Mermaid versionado:

- Lógica / componentes: [Diagrams-components](Diagrams-components)
- Secuencias: [Diagrams-sequences](Diagrams-sequences)
- Clases hexagonales: [Diagrams-classes](Diagrams-classes)
- Datos: [Diagrams-relational](Diagrams-relational)
- Despliegue: [Diagrams-deployment](Diagrams-deployment)
- Integración Adapter: [Diagrams-adapter](Diagrams-adapter)
- Outbox: [Diagrams-outbox](Diagrams-outbox)

### 10.5 Procesos DevOps

Ver [CI-CD](CI-CD) y [Branching](Branching).

### 10.6 Vista de amenazas (inicial)

| Amenaza | Mitigación |
|---------|------------|
| Credenciales en repo | Secrets en CI / env; nunca commit de `.env` |
| Abuso de API | Rate limit en Gateway |
| Eventos duplicados | Consumidores idempotentes + claves de deduplicación |
| Fuga de PII en logs | Redacción de campos sensibles |

## Referencias internas

- Resumen: [Architecture-overview](Architecture-overview)
- DDD: [Bounded-contexts](Bounded-contexts)
- ADRs: [ADRs](ADRs)
