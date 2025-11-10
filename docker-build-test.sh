#!/bin/bash

# Docker Build Test Script
# This script tests the Docker build process without starting services

set -e

echo "🐳 Testing Docker build process..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    exit 1
fi

echo "✓ Docker is running"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Creating from .env.example..."
    cp .env.example .env
    echo "   Please edit .env and set PARENT_AUTH_SECRET"
    echo ""
fi

# Build backend
echo "📦 Building backend image..."
docker compose build --no-cache backend
if [ $? -eq 0 ]; then
    echo "✓ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi
echo ""

# Build frontend
echo "📦 Building frontend image..."
docker compose build --no-cache frontend
if [ $? -eq 0 ]; then
    echo "✓ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi
echo ""

echo "✅ All builds successful!"
echo ""
echo "Next steps:"
echo "  1. Start services: docker compose up"
echo "  2. Run migrations: docker compose exec backend npm run knex -- migrate:latest"
echo "  3. Seed database: docker compose exec backend npm run seed"
echo "  4. Access app: http://localhost:4173"
