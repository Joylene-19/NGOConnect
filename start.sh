#!/bin/bash

# NGOConnect Project Startup Script
# This script will start both the backend and frontend servers

echo "🚀 Starting NGOConnect Project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p server/certificates
mkdir -p server/public
echo "✅ Directories created"

# Start the backend server in the background
echo "🔧 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 3

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started successfully (PID: $BACKEND_PID)"
else
    echo "❌ Failed to start backend server"
    exit 1
fi

# Wait for backend to be fully ready
echo "⏳ Waiting for backend to be ready..."
timeout=30
counter=0
while [ $counter -lt $timeout ]; do
    if curl -s http://localhost:3001/api/test-db > /dev/null 2>&1; then
        echo "✅ Backend server is ready!"
        break
    fi
    sleep 1
    counter=$((counter + 1))
    echo "   Waiting... ($counter/$timeout)"
done

if [ $counter -eq $timeout ]; then
    echo "⚠️  Backend server took longer than expected to start, but continuing..."
fi

# Start the frontend server
echo "🎨 Starting frontend server..."
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for the frontend to start
sleep 3

# Check if frontend is running
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend server started successfully (PID: $FRONTEND_PID)"
else
    echo "❌ Failed to start frontend server"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 NGOConnect is now running!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3001"
echo ""
echo "📋 Available test accounts:"
echo "   👥 Volunteer: volunteer@test.com / password123"
echo "   🏢 NGO: ngo@test.com / password123"
echo "   👑 Admin: admin@test.com / password123"
echo ""
echo "🛑 To stop the servers, press Ctrl+C"
echo ""

# Wait for user to stop the servers
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ Servers stopped. Goodbye!'; exit 0" INT

# Keep the script running
while true; do
    sleep 1
done
