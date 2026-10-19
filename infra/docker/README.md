# Docker Compose

Level 1 stack: Airport Service + Next.js web.

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

From this directory:

```bash
docker compose up --build
```

- Web: http://localhost:3000
- Airport: http://localhost:8081/swagger
