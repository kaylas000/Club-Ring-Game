#!/bin/bash

echo "🥊 Club Ring Game - Startup Script"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker first."
    exit 1
fi

echo "1. Starting containers..."
docker-compose up -d

echo ""
echo "2. Waiting for services to be ready..."
sleep 10

echo ""
echo "3. Running database migrations..."
docker-compose exec -T backend npm run migration:run

echo ""
echo "✅ Club Ring Game is ready!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:4000/api"
echo "WebSocket: ws://localhost:4000"
echo ""

# Keep running
docker-compose logs -f
