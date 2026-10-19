> **Fuente de verdad:** esta página se publica desde `wiki/` / `docs/` del monorepo.
> Edita vía Pull Request en el código; no edites solo en la Wiki sin sincronizar.

# Esquema de clases / hexagonal

Vista conceptual (los nombres coinciden con el código).

```mermaid
classDiagram
  direction TB

  class Airport {
    +ID string
    +Code string
    +Name string
    +Lat float64
    +Lon float64
  }

  class AirportProvider {
    <<interface>>
    +GetByID(id) Airport
    +ListAll() []Airport
  }

  class ColombiaAPIAdapter {
    +GetByID(id) Airport
    +ListAll() []Airport
  }

  class AirportCache {
    <<interface>>
    +Get(key) bytes
    +Set(key, bytes, ttl)
  }

  class GetAirportUseCase {
    +Execute(id) Airport
  }

  class Itinerary {
    +ID string
    +UserName string
    +OriginID string
    +DestinationID string
    +TravelDate date
    +DurationMin int
  }

  class ItineraryRepository {
    <<interface>>
    +Save(Itinerary, OutboxMessage) error
    +Find(id) Itinerary
  }

  class CreateItineraryUseCase {
    +Execute(cmd) Itinerary
  }

  class AirportValidator {
    <<interface>>
    +EnsureExists(id) error
  }

  class OutboxMessage {
    +ID string
    +Type string
    +Payload JSON
    +PublishedAt optional
  }

  AirportProvider <|.. ColombiaAPIAdapter
  GetAirportUseCase --> AirportProvider
  GetAirportUseCase --> AirportCache
  CreateItineraryUseCase --> ItineraryRepository
  CreateItineraryUseCase --> AirportValidator
  ItineraryRepository ..> Itinerary
  ItineraryRepository ..> OutboxMessage
```

## Mapeo SOLID (corto)

- **S:** cada caso de uso y cada adapter tiene una sola razón para cambiar.
- **O:** un proveedor nuevo implementa `AirportProvider` sin editar el código de itinerarios.
- **L:** los adapters honran el contrato del puerto (incluida la semántica de errores).
- **I:** puertos estrechos (`AirportValidator` no es la API de administración del catálogo).
- **D:** la aplicación depende de puertos, no de tipos concretos de HTTP o de BD.
