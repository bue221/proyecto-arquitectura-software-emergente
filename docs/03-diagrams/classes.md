# Class / hexagonal sketch

Conceptual view (not generated from code yet).

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

## SOLID mapping (short)

- **S:** Use cases and adapters have one reason to change.
- **O:** New providers implement `AirportProvider` without editing itinerary code.
- **L:** Adapters honor port contracts (including error semantics).
- **I:** Narrow ports (`AirportValidator` ≠ full catalog admin API).
- **D:** Application depends on ports, not concrete HTTP/DB types.
