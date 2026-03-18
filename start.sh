#!/bin/bash

# start.sh
# Script to start Backend, Frontend, and Docker services together

echo "Starting Docker containers in the background..."
docker compose -f backend/docker-compose.yml up -d

echo "Starting Backend..."
npm --prefix backend run dev &
BACKEND_PID=$!

echo "Starting Frontend..."
npm --prefix frontend run dev &
FRONTEND_PID=$!

echo ""
echo "===================================================="
echo "🚀 Services are starting!"
echo "🐳 Docker: Running"
echo "🛠️  Backend PID: $BACKEND_PID"
echo "🎨 Frontend PID: $FRONTEND_PID"
echo "🛑 Press Ctrl+C to stop all services."
echo "===================================================="
echo ""

# Function to handle script exit and terminate child processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "🐳 Stopping Docker containers..."
    docker compose -f backend/docker-compose.yml down
    
    echo "✅ All services stopped."
    exit 0
}

# Trap Ctrl+C (SIGINT) and call cleanup
trap cleanup SIGINT SIGTERM

# Wait indefinitely for the child processes
wait $BACKEND_PID $FRONTEND_PID
