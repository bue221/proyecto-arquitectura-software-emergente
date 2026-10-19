# Docker Compose

Level 1 stack: Airport Service + Itinerary Service (Postgres) + Next.js web.

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

| Service | Port |
|---------|------|
| Web | 3000 |
| Airport | 8081 |
| Itinerary | 8082 |
| Itinerary Postgres | 5434 |

Note: host port **5434** avoids clashes with other local Postgres instances on 5433.
