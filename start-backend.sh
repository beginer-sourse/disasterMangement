#!/bin/bash

# Start the Jalsaathi Backend
echo "🚀 Starting Jalsaathi Backend..."

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found!"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please update the .env file with your configuration before running again."
    echo "   Especially update the CLOUDINARY credentials for media uploads."
    exit 1
fi

# Start the backend server
echo "🌐 Starting backend server on http://localhost:5001"
npm run dev
