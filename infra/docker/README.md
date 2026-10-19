# Docker Compose

Level 1 + Gateway stack:

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

| Service | Port |
|---------|------|
| Web | 3000 |
| **API Gateway** | **8080** (browser entry) |
| Airport | 8081 |
| Itinerary | 8082 |
| Itinerary Postgres | 5434 |
