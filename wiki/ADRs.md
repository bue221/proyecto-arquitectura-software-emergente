> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Registros de decisiones de arquitectura

| ID | Título | Estado |
|----|--------|--------|
| [ADR-0001](https://github.com/bue221/proyecto-arquitectura-software-emergente/blob/main/docs/01-architecture/adr/0001-monorepo-next-go.md) | Monorepo con Next.js + Go | Aceptado |
| [ADR-0002](https://github.com/bue221/proyecto-arquitectura-software-emergente/blob/main/docs/01-architecture/adr/0002-hexagonal-per-service.md) | Arquitectura hexagonal por servicio | Aceptado |
| [ADR-0003](https://github.com/bue221/proyecto-arquitectura-software-emergente/blob/main/docs/01-architecture/adr/0003-broker-rabbitmq.md) | RabbitMQ como bróker | Aceptado |
| [ADR-0004](https://github.com/bue221/proyecto-arquitectura-software-emergente/blob/main/docs/01-architecture/adr/0004-redis-cache-resilience.md) | Redis para caché de aeropuertos y resiliencia | Aceptado |
| [ADR-0005](https://github.com/bue221/proyecto-arquitectura-software-emergente/blob/main/docs/01-architecture/adr/0005-transactional-outbox.md) | Transactional Outbox para eventos de integración | Aceptado |
| [ADR-0006](https://github.com/bue221/proyecto-arquitectura-software-emergente/blob/main/docs/01-architecture/adr/0006-serverless-notifications.md) | Notificaciones serverless con FaaS local | Aceptado |
| [ADR-0007](https://github.com/bue221/proyecto-arquitectura-software-emergente/blob/main/docs/01-architecture/adr/0007-gateway-no-business-logic.md) | API Gateway sin lógica de negocio | Aceptado |
| [ADR-0008](ADR-0008-api-versioning-pagination) | Versionado de API por URI + paginación de listas | Aceptado |
| [ADR-0009](ADR-0009-grpc-mtls) | gRPC con mTLS entre Airport e Itinerary | Aceptado |

Decisiones nuevas: copia el estilo de los ADR existentes en `docs/01-architecture/adr/`, agrega una fila aquí y abre un PR. Los ADR-0008 y ADR-0009 también tienen página en esta wiki.
