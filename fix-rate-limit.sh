#!/bin/bash

# Fix Rate Limiting Issue for Disaster Reporting Platform
# This script restarts the backend server with more reasonable rate limiting settings

echo "🔧 Fixing rate limiting issue..."

# Kill existing backend processes
echo "Stopping existing backend processes..."
pkill -f "nodemon src/server.ts" 2>/dev/null
pkill -f "node dist/server.js" 2>/dev/null

# Wait a moment for processes to stop
sleep 2

# Start backend with updated rate limiting
echo "Starting backend with updated rate limiting (1000 requests per minute)..."
cd backend

# Set environment variables for more reasonable rate limiting
export RATE_LIMIT_WINDOW_MS=60000  # 1 minute
export RATE_LIMIT_MAX_REQUESTS=1000  # 1000 requests per minute

# Start the server in development mode
npm run dev &

echo "✅ Backend server started with updated rate limiting!"
echo "📊 Rate limiting: 1000 requests per minute (instead of 100 per 15 minutes)"
echo "🌐 API available at: http://localhost:5001"
echo ""
echo "To test the API, run:"
echo "curl http://localhost:5001/api/reports"
echo ""
echo "To stop the server, run:"
echo "pkill -f 'nodemon src/server.ts'"
