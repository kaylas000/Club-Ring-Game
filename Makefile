.PHONY: help install dev build test clean docker-up docker-down

help:
	@echo "Club Ring Game - Available commands:"
	@echo ""
	@echo "Installation:"
	@echo "  make install          Install dependencies"
	@echo "  make dev              Start development (Docker)"
	@echo "  make test             Run tests"
	@echo "  make build            Build for production"
	@echo "  make clean            Clean build artifacts"

install:
	@cd frontend && npm install
	@cd ../backend && npm install

dev: docker-up
	@echo "✅ Development environment started"

test:
	@cd frontend && npm run test
	@cd ../backend && npm run test

build:
	@cd frontend && npm run build
	@cd ../backend && npm run build

docker-up:
	@docker-compose up -d

docker-down:
	@docker-compose down

clean:
	@rm -rf frontend/dist frontend/node_modules
	@rm -rf backend/dist backend/node_modules
