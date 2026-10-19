# Docker Compose

Full local stack (Gateway + Redis + Airport + Itinerary + Web):

```bash
# from repo root
make up
make smoke
make down
```

Or:

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

| Service | Port |
|---------|------|
| Web | 3000 |
| **API Gateway** | **8080** (browser entry) |
| Airport | 8081 |
| Itinerary | 8082 |
| Redis | 6379 |
| Itinerary Postgres | 5434 |
