# Project Wiki — Personal Itineraries Platform

Source of truth for architecture, diagrams, DevOps, and demos. Prefer updating these files via PR (`docs/...` branches) over undocumented chat decisions.

## Index

### Foundations

1. [Vision & scope](00-vision.md)
2. [Architecture overview](01-architecture/overview.md)
3. [Formal architecture document](01-architecture/document.md) (course template, shortened)
4. [Bounded contexts & ubiquitous language](01-architecture/bounded-contexts.md)
5. [Architecture Decision Records](01-architecture/adr/README.md)

### Services

6. [Airport Service](02-services/airport-service.md)
7. [Itinerary Service](02-services/itinerary-service.md)
8. [Notification Function (Serverless)](02-services/notification-function.md)
8b. [API Gateway](02-services/api-gateway.md)

### Diagrams (Mermaid)

9. [Component diagram](03-diagrams/components.md)
10. [Sequence diagrams](03-diagrams/sequences.md)
11. [Class / hexagonal sketch](03-diagrams/classes.md)
12. [Relational model](03-diagrams/relational.md)
13. [Deployment](03-diagrams/deployment.md)
14. [Adapter pattern](03-diagrams/adapter.md)
15. [Bounded contexts map](03-diagrams/bounded-contexts.md)
16. [Outbox & event flow](03-diagrams/outbox.md)

### DevOps

17. [Branching & PR policy](04-devops/branching.md)
18. [PR checklist](04-devops/pr-checklist.md)
19. [CI/CD](04-devops/ci-cd.md)
20. [Quality gates (tests, SonarQube, load)](04-devops/quality.md)

### Operations & evaluation

21. [Local setup](05-runbooks/local-setup.md)
22. [Demo script (rubric evidence)](05-runbooks/demo-script.md)
23. [Self-assessment Levels 1–3](06-self-assessment.md)

### Frontend

24. [Frontend architecture (shadcn)](07-frontend/architecture.md)

### GitHub Wiki

25. [GitHub Wiki publish guide](04-devops/github-wiki.md)  
    Published UI: https://github.com/bue221/proyecto-arquitectura-software-emergente/wiki  
    Seed content: [`../wiki/`](../wiki/)

## How to contribute to the wiki

- One conceptual change per PR when possible.
- Keep Mermaid diagrams in sync with code and ADRs.
- Link new ADRs from [`01-architecture/adr/README.md`](01-architecture/adr/README.md).
