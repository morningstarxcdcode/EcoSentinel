#!/bin/sh

# EcoSentinel Docker Entrypoint Script
set -e

echo "🌍 Starting EcoSentinel Platform..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until pg_isready -h postgres -p 5432 -U postgres; do
  echo "Database is unavailable - sleeping"
  sleep 2
done
echo "✅ Database is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis connection..."
until redis-cli -h redis ping; do
  echo "Redis is unavailable - sleeping"
  sleep 2
done
echo "✅ Redis is ready!"

# Run database migrations (if any)
echo "🔄 Running database migrations..."
# npm run migrate (uncomment when migrations are set up)

# Start AI service in background
echo "🤖 Starting AI service..."
cd /app/ai && python main.py &
AI_PID=$!

# Start API server in background
echo "🚀 Starting API server..."
cd /app && npm run api &
API_PID=$!

# Start Next.js frontend
echo "🎨 Starting frontend..."
cd /app && npm start &
FRONTEND_PID=$!

# Function to handle shutdown
shutdown() {
  echo "🛑 Shutting down services..."
  kill $AI_PID $API_PID $FRONTEND_PID 2>/dev/null || true
  wait
  echo "✅ All services stopped"
  exit 0
}

# Trap signals
trap shutdown SIGTERM SIGINT

# Wait for all background processes
wait
