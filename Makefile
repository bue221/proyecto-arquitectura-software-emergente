COMPOSE := docker compose -f infra/docker/docker-compose.yml

.PHONY: help up down restart logs ps smoke load wiki build demo-evidence

help:
	@echo "Personal Itineraries — local commands"
	@echo ""
	@echo "  make up             Build and start the full Docker stack"
	@echo "  make down           Stop and remove containers"
	@echo "  make restart        down + up"
	@echo "  make logs           Tail logs"
	@echo "  make ps             Show container status"
	@echo "  make smoke          Hit health/gateway smoke checks"
	@echo "  make load           k6 load test against the Gateway (Docker, ~80s)"
	@echo "  make demo-evidence  Capture demo-script HTTP evidence under docs/05-runbooks/evidence/"
	@echo "  make wiki           Publish wiki/ to GitHub Wiki"
	@echo ""
	@echo "URLs after make up:"
	@echo "  Web         http://localhost:3001"
	@echo "  Gateway     http://localhost:8080/health"
	@echo "  Airport     http://localhost:8081/swagger"
	@echo "  Itinerary   http://localhost:8082/swagger"
	@echo "  Notify FaaS http://localhost:8083/health"
	@echo "  RabbitMQ UI http://localhost:15672 (guest/guest)"
	@echo "  Jaeger UI   http://localhost:16686"
	@echo "  Prometheus  http://localhost:9090"

up:
	@./scripts/dev-up.sh

down:
	@./scripts/dev-down.sh

restart: down up

logs:
	$(COMPOSE) logs -f --tail=200

ps:
	$(COMPOSE) ps

smoke:
	@./scripts/dev-smoke.sh

K6_IMAGE ?= grafana/k6:0.54.0
LOAD_BASE ?= http://host.docker.internal:8080

load:
	docker run --rm -i -e BASE=$(LOAD_BASE) $(K6_IMAGE) run - < tests/load/gateway-load.js

demo-evidence:
	@chmod +x ./scripts/demo-evidence.sh
	@./scripts/demo-evidence.sh

wiki:
	@./scripts/publish-wiki.sh

build:
	$(COMPOSE) build
