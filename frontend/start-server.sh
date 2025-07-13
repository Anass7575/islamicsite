#!/bin/bash

echo "=== Starting Al-Hidaya Dev Server ==="
echo ""

# Kill any process on port 3003
echo "Checking port 3003..."
if lsof -Pi :3003 -sTCP:LISTEN -t >/dev/null ; then
    echo "Port 3003 is in use. Attempting to free it..."
    lsof -Pi :3003 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null
    sleep 2
fi

# Clean Next.js cache
echo "Cleaning cache..."
rm -rf .next

# Start the server
echo ""
echo "Starting server on http://localhost:3003"
echo ""
npm run dev