.PHONY: help install dev start test build docker-up docker-down clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

start: ## Start production server
	npm start

test: ## Run tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-coverage: ## Run tests with coverage
	npm run test:coverage

lint: ## Run ESLint
	npm run lint

lint-fix: ## Fix ESLint errors
	npm run lint:fix

docker-build: ## Build Docker images
	docker-compose build

docker-up: ## Start all services with Docker Compose
	docker-compose up -d

docker-down: ## Stop all Docker services
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

docker-shell: ## Access app container shell
	docker-compose exec app sh

docker-clean: ## Clean Docker volumes
	docker-compose down -v

pm2-start: ## Start with PM2
	pm2 start pm2.config.js

pm2-stop: ## Stop PM2
	pm2 stop all

pm2-restart: ## Restart PM2
	pm2 restart all

pm2-logs: ## View PM2 logs
	pm2 logs

clean: ## Clean generated files
	rm -rf node_modules coverage logs/*.log

setup-dev: install docker-up ## Complete development setup
	@echo "Development environment ready!"
	@echo "Run 'make dev' to start the application"